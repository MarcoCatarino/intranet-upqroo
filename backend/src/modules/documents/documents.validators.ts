import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(3).max(255),
  departmentId: z.number(),
});

export const uploadDocumentSchema = z.object({
  documentId: z.number(),
});
