import { mysqlTable, bigint, varchar } from "drizzle-orm/mysql-core";

export const departmentUsers = mysqlTable("department_users", {
  departmentId: bigint("department_id", { mode: "number" }).notNull(),

  userId: varchar("user_id", { length: 36 }).notNull(),

  role: varchar("role", { length: 50 }).notNull(),
});
