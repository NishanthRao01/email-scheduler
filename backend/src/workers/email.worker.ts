import { DelayedError, Worker } from "bullmq";

import { redisConfig } from "../config/redis.ts";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.ts";
import { sendEmail } from "../services/email.smtp.service.ts";
import { workerConfig } from "../config/worker.ts";
import { acquireHourlyLimit } from "../services/email-rate-limiter.service.ts";
import { reserveSendSlot } from "../services/email-delay-limiter.service.ts";
import { rateLimitConfig } from "../config/rate-limit.ts";
import { sendHourlyLimitNotification } from "../services/slack.service.ts";
import { prisma } from "../lib/prisma.ts";

export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job, token) => {
    const { emailId, scheduledFor } = job.data as {
      emailId: string;
      scheduledFor?: number;
    };

    const email = await prisma.email.findUnique({
      where: {
        id: emailId,
      },
      include: {
        sender: true,
        campaign: true,
      },
    });

    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    if (email.status === "SENT") {
      console.log(
        `Email ${email.id} was already sent. Skipping.`,
      );

      return {
        skipped: true,
        reason: "already-sent",
        emailId: email.id,
      };
    }

    /*
     * --------------------------------------------------
     * MINIMUM DELAY
     * --------------------------------------------------
     */

    const minDelayMs = Math.max(
      email.campaign.delayBetweenEmails,
      rateLimitConfig.minEmailDelayMs,
    );

    let sendAt = scheduledFor
      ? new Date(scheduledFor)
      : null;

    if (!sendAt) {
      const slot = await reserveSendSlot({
        senderId: email.senderId,
        minDelayMs,
      });

      sendAt = slot.scheduledAt;
    }

    if (sendAt.getTime() > Date.now()) {
      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          scheduledAt: sendAt,
          status: "PENDING",
        },
      });

      await job.updateData({
        emailId: email.id,
        scheduledFor: sendAt.getTime(),
      });

      console.log(
        `Minimum delay applied. ` +
          `Email ${email.id} will retry at ${sendAt.toISOString()}.`,
      );

      await job.moveToDelayed(
        sendAt.getTime(),
        token,
      );

      throw new DelayedError();
    }

    /*
     * --------------------------------------------------
     * HOURLY RATE LIMIT
     * --------------------------------------------------
     */

    const hourlyLimit = Math.min(
      email.campaign.hourlyLimit,
      rateLimitConfig.maxEmailsPerHourPerSender,
    );

    const allowed = await acquireHourlyLimit({
      senderId: email.senderId,
      hourlyLimit,
      minDelayMs: rateLimitConfig.minEmailDelayMs,
    });

    if (!allowed) {
      const now = new Date();

      const nextHour = new Date(now);

      nextHour.setUTCMinutes(0, 0, 0);
      nextHour.setUTCHours(
        nextHour.getUTCHours() + 1,
      );

  try {
    await sendHourlyLimitNotification({
      userId: email.campaign.userId,
      senderEmail: email.sender.email,
    });
  } catch (error) {
    console.error(
      `Failed to send Slack hourly-limit notification:`,
      error,
    );
  }

      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          scheduledAt: nextHour,
          status: "PENDING",
        },
      });

      /*
       * Clear the previous delay reservation.
       * The email will need to reserve a new slot
       * when it becomes eligible again.
       */
      await job.updateData({
        emailId: email.id,
      });

      console.log(
        `Hourly limit reached for sender ${email.senderId}. ` +
          `Email ${email.id} will retry at ${nextHour.toISOString()}.`,
      );

      await job.moveToDelayed(
        nextHour.getTime(),
        token,
      );

      throw new DelayedError();
    }

    /*
     * --------------------------------------------------
     * PROCESS EMAIL
     * --------------------------------------------------
     */

    await prisma.email.update({
      where: {
        id: email.id,
      },
      data: {
        status: "PROCESSING",
      },
    });

    try {
      const info = await sendEmail({
        from: email.sender.email,
        to: email.recipient,
        subject: email.subject,
        text: email.body,
      });

      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      console.log(
        `Email ${email.id} sent successfully.`,
      );

      if (info.messageId) {
        console.log(
          `Message ID: ${info.messageId}`,
        );
      }

      return {
        sent: true,
        emailId: email.id,
      };
    } catch (error) {
      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "FAILED",
        },
      });

      throw error;
    }
  },
  {
    connection: redisConfig,
    concurrency: workerConfig.concurrency,
  },
);

emailWorker.on("completed", (job) => {
  console.log(
    `Job ${job.id} completed`,
  );
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `Job ${job?.id} failed:`,
    error,
  );
});

emailWorker.on("error", (error) => {
  console.error(
    "Worker error:",
    error,
  );
});