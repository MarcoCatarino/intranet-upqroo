import {
  mysqlTable,
  varchar,
  bigint,
  timestamp,
  primaryKey,
} from "drizzle-orm/mysql-core";

export const directorSharePermissions = mysqlTable(
  "director_share_permissions",
  {
    directorId: varchar("director_id", { length: 36 }).notNull(),

    departmentId: bigint("department_id", { mode: "number" }).notNull(),

    grantedBy: varchar("granted_by", { length: 36 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.directorId, table.departmentId] }),
  }),
);
