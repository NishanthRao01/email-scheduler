import "dotenv/config";

const minEmailDelayMs = Number(
  process.env.MIN_EMAIL_DELAY_MS ?? 2000,
);

const maxEmailsPerHourPerSender = Number(
  process.env.MAX_EMAILS_PER_HOUR_PER_SENDER ?? 100,
);

if (!Number.isInteger(minEmailDelayMs) || minEmailDelayMs < 0) {
  throw new Error(
    "MIN_EMAIL_DELAY_MS must be a non-negative integer",
  );
}

if (
  !Number.isInteger(maxEmailsPerHourPerSender) ||
  maxEmailsPerHourPerSender < 1
) {
  throw new Error(
    "MAX_EMAILS_PER_HOUR_PER_SENDER must be a positive integer",
  );
}

export const rateLimitConfig = {
  minEmailDelayMs,
  maxEmailsPerHourPerSender,
};