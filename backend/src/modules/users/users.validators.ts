import { z } from "zod";

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
