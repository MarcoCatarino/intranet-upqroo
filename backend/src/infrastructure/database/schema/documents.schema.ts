import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

export const documents = mysqlTable("documents", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  title: varchar("title", { length: 255 }).notNull(),

  departmentId: bigint("department_id", { mode: "number" }).notNull(),

  ownerId: varchar("owner_id", { length: 36 }).notNull(),

  currentVersion: bigint("current_version", { mode: "number" }).default(1),

  isDeleted: boolean("is_deleted").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});
