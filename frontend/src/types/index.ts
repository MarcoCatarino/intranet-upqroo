export type UserRole =
  | "admin"
  | "secretary"
  | "director"
  | "assistant"
  | "professor"
  | "student";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  secretary: "Secretaría",
  director: "Director",
  assistant: "Asistente",
  professor: "Profesor",
  student: "Alumno",
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  secretary: 4,
  director: 3,
  assistant: 2,
  professor: 2,
  student: 1,
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface Document {
  id: number;
  title: string;
  description: string | null;
  ownerId: string;
  departmentId: number;
  currentVersion: number;
  // mimeType de la versión actual — usado para mostrar el ícono correcto
  mimeType: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  version: number;
  filePath: string;
  mimeType: string;
  fileSize: number;
  fileHash: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface DocumentPermission {
  id: number;
  documentId: number;
  userId: string | null;
  departmentId: number | null;
  permission: PermissionType;
  grantedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  documentId: number;
  userId: string;
  action: AuditAction;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export type PermissionType =
  | "view"
  | "download"
  | "upload_version"
  | "edit"
  | "share";

export type AuditAction =
  | "document_created"
  | "document_uploaded"
  | "document_updated"
  | "document_deleted";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
}
