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

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 req/minute * user
  keyGenerator: (req) => {
    // If Auth TRUE = UserID as KEY || Auth FALSE = IP [use in public endpoints]
    return req.user?.id ?? req.ip ?? "anonymous";
  },
  message: { message: "Demasiadas peticiones, espera un momento" },
  standardHeaders: true,
  legacyHeaders: false,
});
