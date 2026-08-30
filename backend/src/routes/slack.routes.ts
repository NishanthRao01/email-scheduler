import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.ts";

import {
  slackAuthController,
  slackCallbackController,
  slackDisconnectController,
} from "../controllers/slack.controller.ts";

const router = Router();

router.get(
  "/connect",
  authMiddleware,
  slackAuthController,
);

router.get(
  "/callback",
  slackCallbackController,
);

router.delete(
  "/disconnect",
  authMiddleware,
  slackDisconnectController,
);

export default router;