import { Router } from "express";

import { healthCheck } from "../controllers/health.controller.js";

export const router = Router();

router.get("/health", healthCheck);
