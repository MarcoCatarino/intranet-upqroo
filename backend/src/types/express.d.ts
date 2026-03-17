import "express";
import { UserRole } from "../infrastructure/database/schema/users.schema.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: UserRole;
      };
    }
  }
}
