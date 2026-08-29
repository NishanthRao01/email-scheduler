import { Worker } from "bullmq";

import { redisConfig } from "../config/redis.ts";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.ts";
import { prisma } from "../lib/prisma.ts";

export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    const { emailId } = job.data as {
      emailId: string;
    };

    const email = await prisma.email.findUnique({
      where: {
        id: emailId,
      },
    });

    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    console.log("Processing email:", {
      id: email.id,
      recipient: email.recipient,
      subject: email.subject,
      scheduledAt: email.scheduledAt,
    });

    return {
      processed: true,
      emailId: email.id,
    };
  },
  {
    connection: redisConfig,
    concurrency: 2,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

emailWorker.on("error", (error) => {
  console.error("Worker error:", error);
});