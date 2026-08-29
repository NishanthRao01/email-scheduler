import { Redis } from "ioredis";

import { redisConfig } from "../config/redis.ts";

export const redis = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});