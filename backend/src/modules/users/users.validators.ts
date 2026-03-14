import { z } from "zod";

export const searchUsersSchema = z.object({
  q: z.string().min(1).max(100),
});

export const departmentUsersSchema = z.object({
  departmentId: z.coerce.number(),
});
