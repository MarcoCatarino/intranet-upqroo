import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(100),
});

export const departmentIdSchema = z.object({
  departmentId: z.coerce.number(),
});

export const addUserSchema = z.object({
  departmentId: z.number(),
  userId: z.string().uuid(),
  role: z.string().min(2).max(50),
});
