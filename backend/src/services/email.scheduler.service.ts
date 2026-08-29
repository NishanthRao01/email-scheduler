import { emailQueue } from "../queues/email.queue.ts";
import { prisma } from "../lib/prisma.ts";

interface ScheduleQueueEmailInput {
  emailId: string;
  scheduledAt: Date;
}

export const scheduleEmailJob = async ({
  emailId,
  scheduledAt,
}: ScheduleQueueEmailInput) => {
  const delay = Math.max(
    0,
    scheduledAt.getTime() - Date.now(),
  );

  const job = await emailQueue.add(
    "send-email",
    {
      emailId,
    },
    {
      jobId: `email-${emailId}`,
      delay,
      removeOnComplete: false,
      removeOnFail: false,
    },
  );

  return job;
};

export const rescheduleEmailJob = async (
  emailId: string,
  scheduledAt: Date,
) => {
  const delay = Math.max(
    0,
    scheduledAt.getTime() - Date.now(),
  );

  await prisma.email.update({
    where: {
      id: emailId,
    },
    data: {
      scheduledAt,
      status: "PENDING",
    },
  });

  await emailQueue.add(
    "send-email",
    {
      emailId,
    },
    {
      jobId: `email-${emailId}`,
      delay,
      removeOnComplete: false,
      removeOnFail: false,
    },
  );
};