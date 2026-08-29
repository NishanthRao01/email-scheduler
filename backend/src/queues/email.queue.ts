import { Queue } from "bullmq";

import { redisConfig } from "../config/redis.ts";

export const EMAIL_QUEUE_NAME = "email-send";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConfig,
});