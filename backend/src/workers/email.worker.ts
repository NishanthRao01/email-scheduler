import { Worker } from "bullmq";

import { redisConfig } from "../config/redis.ts";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.ts";

export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    console.log("Processing job:", job.id);
    console.log("Job data:", job.data);

    return {
      processed: true,
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