import { db } from "../../infrastructure/database/drizzle.js";
import { desc, eq } from "drizzle-orm";
import { documentAuditLogs } from "../../infrastructure/database/schema/document_audit_logs.schema.js";

export type AuditAction =
  | "document_created"
  | "document_uploaded"
  | "document_updated"
  | "document_deleted";

export async function insertAuditLog(data: {
  documentId: number;
  userId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(documentAuditLogs).values({
    documentId: data.documentId,
    userId: data.userId,
    action: data.action,
    metadata: data.metadata ?? null,
  });
}

export async function getAuditLogsForDocument(documentId: number) {
  return db
    .select()
    .from(documentAuditLogs)
    .where(eq(documentAuditLogs.documentId, documentId))
    .orderBy(desc(documentAuditLogs.createdAt));
}
