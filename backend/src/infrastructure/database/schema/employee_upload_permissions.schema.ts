import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  primaryKey,
} from "drizzle-orm/mysql-core";

export const employeeUploadPermissions = mysqlTable(
  "employee_upload_permissions",
  {
    employeeId: varchar("employee_id", { length: 36 }).notNull(),

    departmentId: int("department_id", { unsigned: true }).notNull(),

    grantedBy: varchar("granted_by", { length: 36 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.employeeId, table.departmentId] }),
  }),
);
