import { Router } from "express";
import { googleLogin } from "./auth.controller.js";
import { authRateLimiter } from "../../middleware/rateLimit.middleware.js";

const router = Router();

/**
 * Google OAuth login
 * Rate limited to prevent abuse
 */
router.post("/google", authRateLimiter, googleLogin);

export default router;
