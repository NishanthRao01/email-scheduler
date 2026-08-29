import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.ts";

import { scheduleEmailsController } from "../controllers/email.controller.ts";

const router = Router();

router.use(authMiddleware);

router.post("/schedule", scheduleEmailsController);

export default router;