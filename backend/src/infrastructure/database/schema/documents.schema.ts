import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const documents = mysqlTable("documents", {
  id: bigint("id", { mode: "number" }).primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description"),

  ownerId: bigint("owner_id", { mode: "number" }).notNull(),

  hash: varchar("hash", { length: 32 }).notNull(),

  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow(),
});
