import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

// Roles que pueden subir documentos al sistema (sin permiso especial)
const UPLOAD_ROLES: UserRole[] = [
  "admin",
  "secretary",
  "director",
  "assistant",
];

// Roles que pueden editar metadatos de documentos
const EDIT_ROLES: UserRole[] = ["admin", "secretary", "director", "assistant"];

// Roles que pueden compartir documentos
const SHARE_ROLES: UserRole[] = ["admin", "secretary", "director", "assistant"];

// Roles que pueden eliminar documentos
const DELETE_ROLES: UserRole[] = ["admin", "secretary", "director"];

// Todos los roles autenticados pueden ver documentos a los que tienen acceso
const VIEW_ROLES: UserRole[] = [
  "admin",
  "secretary",
  "director",
  "assistant",
  "professor",
  "employee",
  "student",
];

export function canUploadDocument(role: UserRole): boolean {
  return UPLOAD_ROLES.includes(role);
}

export function canEditDocument(role: UserRole): boolean {
  return EDIT_ROLES.includes(role);
}

export function canShareDocument(role: UserRole): boolean {
  return SHARE_ROLES.includes(role);
}

export function canDeleteDocument(role: UserRole): boolean {
  return DELETE_ROLES.includes(role);
}

export function canViewDocument(role: UserRole): boolean {
  return VIEW_ROLES.includes(role);
}

/**
 * Profesores con permiso habilitado por su director pueden subir documentos.
 */
export function canProfessorUpload(
  role: UserRole,
  hasUploadPermission: boolean,
): boolean {
  if (role === "professor") return hasUploadPermission;
  return canUploadDocument(role);
}

/**
 * Empleados con permiso habilitado por su director pueden subir documentos.
 */
export function canEmployeeUpload(
  role: UserRole,
  hasUploadPermission: boolean,
): boolean {
  if (role === "employee") return hasUploadPermission;
  return canUploadDocument(role);
}
