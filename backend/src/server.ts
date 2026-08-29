import app from "./app.ts";
import { env } from "./config/env.ts";

const server = app.listen(env.port, () => {
  console.log(`API server running on http://localhost:${env.port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));