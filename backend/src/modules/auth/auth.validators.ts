import { z } from "zod";

export const googleAuthSchema = z.object({
  token: z.string().min(10),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
