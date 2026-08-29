import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.ts";

import { testQueueController } from "../controllers/queue.controller.ts";

const router = Router();
router.use(authMiddleware);

router.post("/test", testQueueController);

export default router;