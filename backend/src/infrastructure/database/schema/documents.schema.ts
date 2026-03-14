import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const documents = mysqlTable("documents", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  title: varchar("title", { length: 255 }).notNull(),

  description: varchar("description", { length: 1000 }),

  ownerId: varchar("owner_id", { length: 36 }).notNull(),

  departmentId: int("department_id").notNull(),

  currentVersion: int("current_version").default(1),

  createdAt: timestamp("created_at").defaultNow(),

  deletedAt: timestamp("deleted_at"),
});
