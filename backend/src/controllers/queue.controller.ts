import type { RequestHandler } from "express";

import { emailQueue } from "../queues/email.queue.ts";

export const testQueueController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const job = await emailQueue.add(
      "test-job",
      {
        message: "Hello from BullMQ",
      },
      {
        delay: 10_000,
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    res.status(201).json({
      success: true,
      jobId: job.id,
      message: "Test job scheduled for 10 seconds",
    });
  } catch (error) {
    next(error);
  }
};