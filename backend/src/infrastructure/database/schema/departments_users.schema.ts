import { mysqlTable, int, varchar, primaryKey } from "drizzle-orm/mysql-core";

export const departmentUsers = mysqlTable(
  "department_users",
  {
    departmentId: int("department_id", { unsigned: true }).notNull(),

    userId: varchar("user_id", { length: 36 }).notNull(),

    role: varchar("role", { length: 50 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.departmentId] }),
  }),
);
