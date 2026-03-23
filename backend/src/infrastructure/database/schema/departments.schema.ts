import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const departments = mysqlTable("departments", {
  id: int("id", { unsigned: true }).primaryKey().autoincrement(),

  name: varchar("name", { length: 150 }).notNull(),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  parentId: int("parent_id", { unsigned: true }),

  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow(),
});
