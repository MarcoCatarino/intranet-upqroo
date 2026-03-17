import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/mysql-core";

export const documents = mysqlTable("documents", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description"),

  ownerId: varchar("owner_id", { length: 36 }).notNull(),

  departmentId: bigint("department_id", { mode: "number" }).notNull(),

  currentVersion: bigint("current_version", { mode: "number" })
    .notNull()
    .default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  deletedAt: timestamp("deleted_at"),
});
