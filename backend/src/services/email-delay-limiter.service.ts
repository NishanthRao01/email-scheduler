import { redis } from "../lib/redis.ts";

interface ReserveSendSlotInput {
  senderId: string;
  minDelayMs: number;
}

interface ReserveSendSlotResult {
  waitMs: number;
  scheduledAt: Date;
}

const RESERVE_SLOT_SCRIPT = `
local currentTime = tonumber(ARGV[1])
local delayMs = tonumber(ARGV[2])

local nextSendTime = tonumber(redis.call("GET", KEYS[1]) or "0")

local scheduledTime = math.max(currentTime, nextSendTime)

local nextAvailableTime = scheduledTime + delayMs

redis.call("SET", KEYS[1], nextAvailableTime)

return scheduledTime
`;

export const reserveSendSlot = async ({
  senderId,
  minDelayMs,
}: ReserveSendSlotInput): Promise<ReserveSendSlotResult> => {
  const now = Date.now();

  const key = `email-delay:${senderId}`;

  const result = await redis.eval(
    RESERVE_SLOT_SCRIPT,
    1,
    key,
    now,
    minDelayMs,
  );

  const scheduledAtMs = Number(result);

  return {
    waitMs: Math.max(0, scheduledAtMs - now),
    scheduledAt: new Date(scheduledAtMs),
  };
};