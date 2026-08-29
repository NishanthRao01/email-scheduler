import { redis } from "../lib/redis.ts";

interface AcquireRateLimitInput {
  senderId: string;
  hourlyLimit: number;
  minDelayMs: number;
}

interface AcquireRateLimitResult {
  allowed: boolean;
  retryAt?: Date;
}

const RATE_LIMIT_SCRIPT = `
local count = tonumber(redis.call("GET", KEYS[1]) or "0")

if count >= tonumber(ARGV[1]) then
  return 0
end

redis.call("INCR", KEYS[1])
redis.call("EXPIRE", KEYS[1], ARGV[2])

return 1
`;

export const acquireHourlyLimit = async ({
  senderId,
  hourlyLimit,
}: AcquireRateLimitInput): Promise<boolean> => {
  const now = new Date();

  const hourWindow = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
  ].join("");

  const key = `email-rate:${senderId}:${hourWindow}`;

  const secondsUntilNextHour =
    60 * 60 - now.getUTCMinutes() * 60 - now.getUTCSeconds();

  const result = await redis.eval(
    RATE_LIMIT_SCRIPT,
    1,
    key,
    hourlyLimit,
    Math.max(secondsUntilNextHour, 1),
  );

  return Number(result) === 1;
};