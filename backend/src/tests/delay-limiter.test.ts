import { reserveSendSlot } from "../services/email-delay-limiter.service.ts";
import { redis } from "../lib/redis.ts";

const run = async () => {
  const senderId = "delay-test-sender";

  for (let i = 1; i <= 5; i++) {
    const result = await reserveSendSlot({
      senderId,
      minDelayMs: 2000,
    });

    console.log(`Attempt ${i}:`, {
      waitMs: result.waitMs,
      scheduledAt: result.scheduledAt.toISOString(),
    });
  }

  await redis.quit();
};

run().catch((error) => {
  console.error("Delay limiter test failed:", error);
  process.exit(1);
});