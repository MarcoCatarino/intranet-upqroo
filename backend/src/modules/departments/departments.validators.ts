import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(100),
  parentId: z.number().optional(),
});

export const departmentIdSchema = z.object({
  departmentId: z.coerce.number(),
});

export const addUserSchema = z.object({
  departmentId: z.number(),
  userId: z.string().uuid(),
  role: z.string().min(2).max(50),
});

export const professorUploadSchema = z.object({
  departmentId: z.coerce.number(),
  professorId: z.string().uuid(),
});

export const directorShareSchema = z.object({
  departmentId: z.coerce.number(),
  directorId: z.string().uuid(),
});
