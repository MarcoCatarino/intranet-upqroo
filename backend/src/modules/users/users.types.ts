import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface UserDepartment {
  id: string;
  email: string;
  name: string;
}
