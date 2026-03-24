import {
  mysqlTable,
  bigint,
  int,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

export const documentPermissions = mysqlTable("document_permissions", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),

  documentId: bigint("document_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),

  userId: varchar("user_id", { length: 36 }),

  departmentId: int("department_id", { unsigned: true }),

  permission: varchar("permission", { length: 20 }).notNull(),

  targetAudience: varchar("target_audience", { length: 20 })
    .notNull()
    .default("all"),

  grantedBy: varchar("granted_by", { length: 36 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
