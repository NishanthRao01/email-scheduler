import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.ts";

import {
  scheduleEmailsController,
  getScheduledEmailsController,
  getSentEmailsController,
  getSendersController,
} from "../controllers/email.controller.ts";

const router = Router();

router.use(authMiddleware);

router.post("/schedule", scheduleEmailsController);

router.get("/scheduled", getScheduledEmailsController);

router.get("/sent", getSentEmailsController);

router.get("/senders", getSendersController);

export default router;