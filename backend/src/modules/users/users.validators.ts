import { z } from "zod";
import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export const searchUsersSchema = z.object({
  q: z.string().min(1).max(100),
});

export const departmentUsersSchema = z.object({
  departmentId: z.coerce.number(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const CREATABLE_ROLES: Record<string, UserRole[]> = {
  admin: ["secretary"],
  secretary: ["director", "assistant"],
  director: ["professor"],
};

export const createUserSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().endsWith("@upqroo.edu.mx"),
  role: z.enum(["secretary", "director", "assistant", "professor"]),
  departmentId: z.number().optional(),
});
