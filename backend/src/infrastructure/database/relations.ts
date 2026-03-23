import { relations } from "drizzle-orm";

import { users } from "./schema/users.schema.js";
import { departmentUsers } from "./schema/departments_users.schema.js";
import { documentVersions } from "./schema/document_versions.schema.js";
import { documentPermissions } from "./schema/document_permissions.schema.js";
import { departments } from "./schema/departments.schema.js";
import { documents } from "./schema/documents.schema.js";
import { documentAuditLogs } from "./schema/document_audit_logs.schema.js";
import { professorUploadPermissions } from "./schema/professor_upload_permissions.schema.js";
import { directorSharePermissions } from "./schema/director_share_permissions.schema.js";
import { studentEnrollments } from "./schema/student_enrollments.schema.js";

/* =========================
   USERS
========================= */

export const usersRelations = relations(users, ({ many }) => ({
  departments: many(departmentUsers),
  uploadedDocuments: many(documentVersions),
  grantedPermissions: many(documentPermissions),
  uploadPermissions: many(professorUploadPermissions),
  sharePermissions: many(directorSharePermissions),
  uploadedEnrollments: many(studentEnrollments),
}));

/* =========================
   DEPARTMENTS
========================= */

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  users: many(departmentUsers),
  documents: many(documents),
  children: many(departments, { relationName: "parent" }),
  enrollments: many(studentEnrollments),
  parent: one(departments, {
    fields: [departments.parentId],
    references: [departments.id],
    relationName: "parent",
  }),
}));

/* =========================
   DEPARTMENT USERS
========================= */

export const departmentUsersRelations = relations(
  departmentUsers,
  ({ one }) => ({
    department: one(departments, {
      fields: [departmentUsers.departmentId],
      references: [departments.id],
    }),
    user: one(users, {
      fields: [departmentUsers.userId],
      references: [users.id],
    }),
  }),
);

/* =========================
   PROFESSOR UPLOAD PERMISSIONS
========================= */

export const professorUploadPermissionsRelations = relations(
  professorUploadPermissions,
  ({ one }) => ({
    professor: one(users, {
      fields: [professorUploadPermissions.professorId],
      references: [users.id],
    }),
    department: one(departments, {
      fields: [professorUploadPermissions.departmentId],
      references: [departments.id],
    }),
    grantedByUser: one(users, {
      fields: [professorUploadPermissions.grantedBy],
      references: [users.id],
    }),
  }),
);

/* =========================
   DIRECTOR SHARE PERMISSIONS
========================= */

export const directorSharePermissionsRelations = relations(
  directorSharePermissions,
  ({ one }) => ({
    director: one(users, {
      fields: [directorSharePermissions.directorId],
      references: [users.id],
    }),
    department: one(departments, {
      fields: [directorSharePermissions.departmentId],
      references: [departments.id],
    }),
    grantedByUser: one(users, {
      fields: [directorSharePermissions.grantedBy],
      references: [users.id],
    }),
  }),
);

/* =========================
   DOCUMENTS
========================= */

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, {
    fields: [documents.ownerId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [documents.departmentId],
    references: [departments.id],
  }),
  versions: many(documentVersions),
  permissions: many(documentPermissions),
  auditLogs: many(documentAuditLogs),
}));

/* =========================
   DOCUMENT VERSIONS
========================= */

export const documentVersionsRelations = relations(
  documentVersions,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentVersions.documentId],
      references: [documents.id],
    }),
    uploader: one(users, {
      fields: [documentVersions.uploadedBy],
      references: [users.id],
    }),
  }),
);

/* =========================
   DOCUMENT PERMISSIONS
========================= */

export const documentPermissionsRelations = relations(
  documentPermissions,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentPermissions.documentId],
      references: [documents.id],
    }),
    user: one(users, {
      fields: [documentPermissions.userId],
      references: [users.id],
    }),
    department: one(departments, {
      fields: [documentPermissions.departmentId],
      references: [departments.id],
    }),
    grantedByUser: one(users, {
      fields: [documentPermissions.grantedBy],
      references: [users.id],
    }),
  }),
);

/* =========================
   DOCUMENT AUDIT LOGS
========================= */

export const documentAuditLogsRelations = relations(
  documentAuditLogs,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentAuditLogs.documentId],
      references: [documents.id],
    }),
    user: one(users, {
      fields: [documentAuditLogs.userId],
      references: [users.id],
    }),
  }),
);

/* =========================
   STUDENT ENROLLMENTS
========================= */

export const studentEnrollmentsRelations = relations(
  studentEnrollments,
  ({ one }) => ({
    department: one(departments, {
      fields: [studentEnrollments.departmentId],
      references: [departments.id],
    }),
    uploadedByUser: one(users, {
      fields: [studentEnrollments.uploadedBy],
      references: [users.id],
    }),
  }),
);
