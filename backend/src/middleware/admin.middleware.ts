import { Request, Response, NextFunction } from "express";
import { db } from "../infrastructure/database/drizzle.js";
import { eq } from "drizzle-orm";
import { users } from "../infrastructure/database/schema/users.schema.js";

export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const result = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = result[0];

  if (!user || user.isAdmin !== 1) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}
