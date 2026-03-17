import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export type UserRole =
  | "admin"
  | "secretary"
  | "director"
  | "professor"
  | "student";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),

  googleId: varchar("google_id", { length: 100 }).notNull().unique(),

  email: varchar("email", { length: 150 }).notNull().unique(),

  name: varchar("name", { length: 150 }).notNull(),

  avatarUrl: varchar("avatar_url", { length: 255 }),

  role: varchar("role", { length: 20 }).notNull().default("student"),

  createdAt: timestamp("created_at").defaultNow(),
});
