import {
  mysqlTable,
  varchar,
  int,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const departments = mysqlTable("departments", {
  id: int("id").primaryKey(),

  name: varchar("name", { length: 120 }).notNull(),

  description: text("description"),

  createdAt: timestamp("created_at").defaultNow(),
});
