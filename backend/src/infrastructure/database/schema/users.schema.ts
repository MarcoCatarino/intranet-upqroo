import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),

  googleId: varchar("google_id", { length: 100 }).notNull().unique(),

  email: varchar("email", { length: 150 }).notNull().unique(),

  name: varchar("name", { length: 150 }).notNull(),

  avatarUrl: varchar("avatar_url", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow(),
});
