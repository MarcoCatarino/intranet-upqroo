import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const documents = mysqlTable("documents", {
  id: int("id").primaryKey().autoincrement(),

  title: varchar("title", { length: 255 }).notNull(),

  description: varchar("description", { length: 1000 }),

  ownerId: varchar("owner_id", { length: 36 }).notNull(),

  departmentId: int("department_id").notNull(),

  currentVersion: int("current_version").notNull().default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  deletedAt: timestamp("deleted_at"),
});
