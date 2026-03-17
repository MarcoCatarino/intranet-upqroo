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

export const shareDocumentSchema = z
  .object({
    documentId: z.number(),
    userId: z.string().optional(),
    departmentId: z.number().optional(),
    permission: z.enum(["view", "download", "upload_version", "edit", "share"]),
  })
  .refine(
    (data) => {
      const hasUser = !!data.userId;
      const hasDepartment = !!data.departmentId;

      return (hasUser || hasDepartment) && !(hasUser && hasDepartment);
    },
    {
      message: "Must provide either userId or departmentId",
    },
  );

export const revokePermissionSchema = z
  .object({
    userId: z.string().optional(),
    departmentId: z.number().optional(),
  })
  .refine((data) => data.userId || data.departmentId, {
    message: "userId or departmentId required",
  });

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
