import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}
