import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export interface GooglePayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
