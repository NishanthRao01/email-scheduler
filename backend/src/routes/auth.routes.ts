import { Router } from "express";

import {
  googleAuthController,
  googleCallbackController,
} from "../controllers/auth.controller.ts";

const router = Router();

router.get(
  "/google",
  googleAuthController,
);

router.get(
  "/google/callback",
  googleCallbackController,
);

export default router;