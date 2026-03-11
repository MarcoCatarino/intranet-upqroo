import { mysqlTable, varchar, bigint, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),

  googleId: varchar("google_id", { length: 100 }).notNull(),

  email: varchar("email", { length: 150 }).notNull(),

  name: varchar("name", { length: 150 }).notNull(),

  avatarUrl: varchar("avatar_url", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow(),
});
