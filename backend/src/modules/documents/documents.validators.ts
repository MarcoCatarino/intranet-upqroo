import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  departmentId: z.number(),
});

export const uploadDocumentSchema = z.object({
  documentId: z.number(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(1000).optional(),
  departmentId: z.number().optional(),
});

export const shareDocumentSchema = z.object({
  documentId: z.number(),
  departmentId: z.number(),
  permission: z.enum(["view", "download", "upload_version", "edit", "share"]),
});

export const revokePermissionSchema = z.object({
  departmentId: z.number(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
