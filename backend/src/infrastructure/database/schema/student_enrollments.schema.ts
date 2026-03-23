import {
  mysqlTable,
  varchar,
  bigint,
  timestamp,
  primaryKey,
} from "drizzle-orm/mysql-core";

export const studentEnrollments = mysqlTable(
  "student_enrollments",
  {
    matricula: varchar("matricula", { length: 20 }).notNull(),

    departmentId: bigint("department_id", { mode: "number" }).notNull(),

    uploadedBy: varchar("uploaded_by", { length: 36 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.matricula, table.departmentId] }),
  }),
);
