import { AppError } from "../utils/errors.ts";

export interface ScheduleEmailInput {
  userId: string;
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export const validateScheduleEmailInput = (
  input: unknown,
): ScheduleEmailInput => {
  if (!input || typeof input !== "object") {
    throw new AppError("Request body is required", 400);
  }

  const data = input as Record<string, unknown>;

  if (typeof data.userId !== "string" || !data.userId.trim()) {
    throw new AppError("userId is required", 400);
  }

  if (typeof data.senderId !== "string" || !data.senderId.trim()) {
    throw new AppError("senderId is required", 400);
  }

  if (typeof data.subject !== "string" || !data.subject.trim()) {
    throw new AppError("subject is required", 400);
  }

  if (typeof data.body !== "string" || !data.body.trim()) {
    throw new AppError("body is required", 400);
  }

  if (
    !Array.isArray(data.recipients) ||
    data.recipients.length === 0
  ) {
    throw new AppError("At least one recipient is required", 400);
  }

  if (
    !data.recipients.every(
      (recipient) =>
        typeof recipient === "string" &&
        recipient.trim().length > 0,
    )
  ) {
    throw new AppError("Recipients must be non-empty strings", 400);
  }

  if (typeof data.startTime !== "string") {
    throw new AppError("startTime is required", 400);
  }

  const startTime = new Date(data.startTime);

  if (Number.isNaN(startTime.getTime())) {
    throw new AppError("startTime must be a valid date", 400);
  }

  if (
    typeof data.delayBetweenEmails !== "number" ||
    !Number.isInteger(data.delayBetweenEmails) ||
    data.delayBetweenEmails < 0
  ) {
    throw new AppError(
      "delayBetweenEmails must be a non-negative integer",
      400,
    );
  }

  if (
    typeof data.hourlyLimit !== "number" ||
    !Number.isInteger(data.hourlyLimit) ||
    data.hourlyLimit <= 0
  ) {
    throw new AppError(
      "hourlyLimit must be a positive integer",
      400,
    );
  }

  return {
    userId: data.userId.trim(),
    senderId: data.senderId.trim(),
    subject: data.subject.trim(),
    body: data.body,
    recipients: data.recipients.map((recipient) => recipient.trim()),
    startTime: startTime.toISOString(),
    delayBetweenEmails: data.delayBetweenEmails,
    hourlyLimit: data.hourlyLimit,
  };
};