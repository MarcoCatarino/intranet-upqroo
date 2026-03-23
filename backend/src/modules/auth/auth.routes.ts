import { Router } from "express";
import { googleLogin, logout } from "./auth.controller.js";
import { authRateLimiter } from "../../middleware/rateLimit.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * Google OAuth login
 * Rate limited to prevent abuse
 */
router.post("/google", authRateLimiter, googleLogin);

/**
 * Logout — clears the session cookie
 * Requires valid session (authMiddleware)
 */
router.post("/logout", authMiddleware, logout);

export default router;
