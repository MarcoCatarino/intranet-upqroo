import { mysqlTable, bigint, varchar, timestamp } from "drizzle-orm/mysql-core";

export const departments = mysqlTable("departments", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  name: varchar("name", { length: 150 }).notNull(),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  parentId: bigint("parent_id", { mode: "number" }),

  createdAt: timestamp("created_at").defaultNow(),
});
