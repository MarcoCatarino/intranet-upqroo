import { mysqlTable, bigint, varchar, timestamp } from "drizzle-orm/mysql-core";

export const documentVersions = mysqlTable("document_versions", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  documentId: bigint("document_id", { mode: "number" }).notNull(),

  version: bigint("version", { mode: "number" }).notNull(),

  filePath: varchar("file_path", { length: 500 }).notNull(),

  mimeType: varchar("mime_type", { length: 100 }).notNull(),

  fileSize: bigint("file_size", { mode: "number" }).notNull(),

  uploadedBy: varchar("uploaded_by", { length: 36 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
