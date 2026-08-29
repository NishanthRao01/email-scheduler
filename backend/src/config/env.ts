import "dotenv/config";

const port = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be a valid port number");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
} as const;