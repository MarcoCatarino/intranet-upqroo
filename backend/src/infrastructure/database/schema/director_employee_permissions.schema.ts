import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  primaryKey,
} from "drizzle-orm/mysql-core";

export const directorEmployeePermissions = mysqlTable(
  "director_employee_permissions",
  {
    directorId: varchar("director_id", { length: 36 }).notNull(),

    departmentId: int("department_id", { unsigned: true }).notNull(),

    grantedBy: varchar("granted_by", { length: 36 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.directorId, table.departmentId] }),
  }),
);
