import { Router } from "express";

import {
  googleAuthController,
  googleCallbackController,
  googleMeController,
} from "../controllers/auth.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();

router.get(
  "/google",
  googleAuthController,
);

router.get(
  "/google/callback",
  googleCallbackController,
);

router.get(
  "/me",
  authMiddleware,
  googleMeController,
);

export default router;