import { Request, Response, NextFunction } from "express";
import { db } from "../infrastructure/database/drizzle.js";
import { eq } from "drizzle-orm";
import {
  users,
  UserRole,
} from "../infrastructure/database/schema/users.schema.js";

// Roles que no están en DB — no se buscan
const EPHEMERAL_ROLES: UserRole[] = ["student", "professor"];

export function roleMiddleware(...allowedRoles: UserRole[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    const jwtRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (jwtRole && EPHEMERAL_ROLES.includes(jwtRole)) {
      if (!allowedRoles.includes(jwtRole)) {
        return res.status(403).json({
          message: `Access restricted to: ${allowedRoles.join(", ")}`,
        });
      }
      return next();
    }

    const result = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = result[0];

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return res.status(403).json({
        message: `Access restricted to: ${allowedRoles.join(", ")}`,
      });
    }

    req.user!.role = user.role as UserRole;

    next();
  };
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return roleMiddleware("admin")(req, res, next);
}
