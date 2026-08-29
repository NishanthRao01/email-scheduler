import cors from "cors";
import express from "express";

import { errorMiddleware } from "./middleware/error.middleware.ts";
import { notFoundMiddleware } from "./middleware/not-found.middleware.ts";
import emailRoutes from "./routes/email.routes.ts";
import queueRoutes from "./routes/queue.routes.ts";
import authRoutes from "./routes/auth.routes.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ReachInbox scheduler API is running",
  });
});

app.use("/api/emails", emailRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/auth", authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;