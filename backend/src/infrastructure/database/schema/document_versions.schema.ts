import {
  mysqlTable,
  int,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

export const documentVersions = mysqlTable("document_versions", {
  id: int("id").primaryKey().autoincrement(),

  documentId: int("document_id").notNull(),

  version: int("version").notNull(),

  filePath: text("file_path").notNull(),

  mimeType: varchar("mime_type", { length: 100 }).notNull(),

  fileSize: int("file_size").notNull(),

  uploadedBy: varchar("uploaded_by", { length: 36 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
