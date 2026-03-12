import { mysqlTable, bigint, varchar, timestamp } from "drizzle-orm/mysql-core";

export const documentPermissions = mysqlTable("document_permissions", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  documentId: bigint("document_id", { mode: "number" }).notNull(),

  userId: varchar("user_id", { length: 36 }),

  departmentId: bigint("department_id", { mode: "number" }),

  permission: varchar("permission", { length: 20 }).notNull(),

  grantedBy: varchar("granted_by", { length: 36 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
