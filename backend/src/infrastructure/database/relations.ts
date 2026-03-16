import { relations } from "drizzle-orm";

import { users } from "./schema/users.schema.js";
import { departmentUsers } from "./schema/departments_users.schema.js";
import { documentVersions } from "./schema/document_versions.schema.js";
import { documentPermissions } from "./schema/document_permissions.schema.js";
import { departments } from "./schema/departments.schema.js";
import { documents } from "./schema/documents.schema.js";

/* =========================
   USERS
========================= */

export const usersRelations = relations(users, ({ many }) => ({
  departments: many(departmentUsers),

  uploadedDocuments: many(documentVersions),

  grantedPermissions: many(documentPermissions),
}));

/* =========================
   DEPARTMENTS
========================= */

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(departmentUsers),

  documents: many(documents),
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
