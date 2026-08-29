import { Router } from "express";

import { scheduleEmailsController } from "../controllers/email.controller.ts";

const router = Router();

router.post("/schedule", scheduleEmailsController);

export default router;