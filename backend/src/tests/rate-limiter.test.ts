import { acquireHourlyLimit } from "../services/email-rate-limiter.service.ts";
import { redis } from "../lib/redis.ts";

const senderId = "rate-limit-test-sender";

const run = async () => {
  for (let i = 1; i <= 5; i++) {
    const allowed = await acquireHourlyLimit({
      senderId,
      hourlyLimit: 3,
      minDelayMs: 2000,
    });

    console.log(
      `Attempt ${i}: ${allowed ? "ALLOWED" : "REJECTED"}`,
    );
  }

  await redis.quit();
};

run().catch((error) => {
  console.error("Rate limiter test failed:", error);
  process.exit(1);
});