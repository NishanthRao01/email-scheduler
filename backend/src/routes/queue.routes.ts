import { Router } from "express";

import { testQueueController } from "../controllers/queue.controller.ts";

const router = Router();

router.post("/test", testQueueController);

export default router;