import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(3).max(255),
  departmentId: z.number(),
});

export const uploadDocumentSchema = z.object({
  documentId: z.number(),
});

export const shareDocumentSchema = z.object({
  documentId: z.number(),
  userId: z.string().optional(),
  departmentId: z.number().optional(),
  permission: z.enum(["view", "download", "upload_version", "edit", "share"]),
});
