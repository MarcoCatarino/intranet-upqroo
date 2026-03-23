import {
  mysqlTable,
  bigint,
  int,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/mysql-core";

export const documents = mysqlTable("documents", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description"),

  ownerId: varchar("owner_id", { length: 36 }).notNull(),

  departmentId: int("department_id", { unsigned: true }).notNull(),

  currentVersion: int("current_version", { unsigned: true })
    .notNull()
    .default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  deletedAt: timestamp("deleted_at"),
});
