import "dotenv/config";

// Managed Redis (Railway, Upstash, Heroku) hands out a single connection URL
// that carries credentials. Fall back to host/port for local development.
const redisUrl = process.env.REDIS_URL;
const parsed = redisUrl ? new URL(redisUrl) : null;

export const redisConfig = {
  host: parsed?.hostname ?? process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(parsed?.port || process.env.REDIS_PORT || 6379),
  username: parsed?.username ? decodeURIComponent(parsed.username) : undefined,
  password: parsed?.password ? decodeURIComponent(parsed.password) : undefined,
  ...(parsed?.protocol === "rediss:" ? { tls: {} } : {}),
};