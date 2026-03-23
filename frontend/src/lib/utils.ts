import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UserRole } from "@/types/index.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function hasRole(
  userRole: UserRole | undefined,
  ...roles: UserRole[]
): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

export function canManageSystem(role: UserRole | undefined): boolean {
  return hasRole(role, "admin");
}

export function canManageDepartments(role: UserRole | undefined): boolean {
  return hasRole(role, "admin");
}

export function canUploadDocuments(role: UserRole | undefined): boolean {
  return hasRole(role, "admin", "secretary", "director", "assistant");
}

export function canShareDocuments(role: UserRole | undefined): boolean {
  return hasRole(role, "admin", "secretary", "director", "assistant");
}

export function canDeleteDocuments(role: UserRole | undefined): boolean {
  return hasRole(role, "admin", "secretary", "director");
}

export function canViewAudit(role: UserRole | undefined): boolean {
  return hasRole(role, "admin", "secretary", "director");
}

export const PERMISSION_LABELS: Record<string, string> = {
  view: "Ver",
  download: "Descargar",
  upload_version: "Subir versión",
  edit: "Editar",
  share: "Compartir",
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  document_created: "Documento creado",
  document_uploaded: "Nueva versión subida",
  document_updated: "Documento actualizado",
  document_deleted: "Documento eliminado",
};
