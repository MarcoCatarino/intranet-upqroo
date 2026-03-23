import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { UserRole } from "../infrastructure/database/schema/users.schema.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[env.AUTH.COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, env.AUTH.JWT_SECRET!) as any;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
      departmentId: decoded.departmentId ?? undefined,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
