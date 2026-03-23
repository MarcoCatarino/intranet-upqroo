import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";

export const documentAuditLogs = mysqlTable("document_audit_logs", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),

  documentId: bigint("document_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),

  userId: varchar("user_id", { length: 36 }).notNull(),

  action: varchar("action", { length: 50 }).notNull(),

  metadata: json("metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
