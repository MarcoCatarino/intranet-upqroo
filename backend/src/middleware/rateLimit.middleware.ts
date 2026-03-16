import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts, try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
