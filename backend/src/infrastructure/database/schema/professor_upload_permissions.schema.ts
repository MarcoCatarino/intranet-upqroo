import {
  mysqlTable,
  varchar,
  bigint,
  timestamp,
  primaryKey,
} from "drizzle-orm/mysql-core";

export const professorUploadPermissions = mysqlTable(
  "professor_upload_permissions",
  {
    professorId: varchar("professor_id", { length: 36 }).notNull(),

    departmentId: bigint("department_id", { mode: "number" }).notNull(),

    grantedBy: varchar("granted_by", { length: 36 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.professorId, table.departmentId] }),
  }),
);
