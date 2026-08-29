import { emailQueue } from "../queues/email.queue.ts";

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