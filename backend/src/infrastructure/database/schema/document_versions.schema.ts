import {
  mysqlTable,
  bigint,
  int,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

export const documentVersions = mysqlTable("document_versions", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),

  documentId: bigint("document_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),

  version: int("version", { unsigned: true }).notNull(),

  filePath: text("file_path").notNull(),

  mimeType: varchar("mime_type", { length: 100 }).notNull(),

  fileSize: bigint("file_size", { mode: "number", unsigned: true }).notNull(),

  fileHash: varchar("file_hash", { length: 64 }),

  uploadedBy: varchar("uploaded_by", { length: 36 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
