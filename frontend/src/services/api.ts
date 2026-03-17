// ============================================================
// UPQROO INTRANET — API Service
// Centraliza todas las llamadas al backend
// ============================================================

import type {
  User,
  Department,
  Document,
  DocumentVersion,
  DocumentPermission,
  AuditLog,
  PermissionType,
  PaginatedResponse,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "Error desconocido" }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  loginWithGoogle: (token: string) =>
    request<{ user: User }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
};

export const usersApi = {
  me: () => request<User>("/users/me"),
  list: (page = 1, limit = 20) =>
    request<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`),
  search: (q: string) =>
    request<User[]>(`/users/search?q=${encodeURIComponent(q)}`),
  byDepartment: (departmentId: number) =>
    request<User[]>(`/users/department/${departmentId}`),
};

export const departmentsApi = {
  list: () => request<Department[]>("/departments"),
  get: (id: number) => request<Department>(`/departments/${id}`),
  create: (data: { name: string; slug: string; parentId?: number }) =>
    request<Department>("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addUser: (data: { departmentId: number; userId: string; role: string }) =>
    request("/departments/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeUser: (departmentId: number, userId: string) =>
    request(`/departments/${departmentId}/user/${userId}`, {
      method: "DELETE",
    }),
  users: (departmentId: number) =>
    request<User[]>(`/departments/${departmentId}/users`),
};

export const documentsApi = {
  list: (page = 1, limit = 20) =>
    request<PaginatedResponse<Document>>(
      `/documents?page=${page}&limit=${limit}`,
    ),
  get: (id: number) => request<Document>(`/documents/${id}`),
  search: (q: string) =>
    request<Document[]>(`/documents/search?q=${encodeURIComponent(q)}`),
  create: (data: {
    title: string;
    description?: string;
    departmentId: number;
  }) =>
    request<{ documentId: number }>("/documents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: number,
    data: { title?: string; description?: string; departmentId?: number },
  ) =>
    request(`/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/documents/${id}`, { method: "DELETE" }),
  upload: (documentId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("documentId", String(documentId));
    return fetch(`${BASE_URL}/documents/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Error al subir archivo" }));
        throw new Error(err.message);
      }
      return res.json();
    });
  },
  versions: (id: number) =>
    request<DocumentVersion[]>(`/documents/${id}/versions`),
  permissions: (id: number) =>
    request<{
      users: Partial<DocumentPermission>[];
      departments: Partial<DocumentPermission>[];
    }>(`/documents/${id}/permissions`),
  share: (data: {
    documentId: number;
    userId?: string;
    departmentId?: number;
    permission: PermissionType;
  }) =>
    request("/documents/share", { method: "POST", body: JSON.stringify(data) }),
  revokePermission: (
    documentId: number,
    data: { userId?: string; departmentId?: number },
  ) =>
    request(`/documents/${documentId}/permissions`, {
      method: "DELETE",
      body: JSON.stringify(data),
    }),
  auditLogs: (id: number) => request<AuditLog[]>(`/documents/${id}/audit`),
  downloadUrl: (documentId: number, version: number) =>
    `${BASE_URL}/documents/${documentId}/version/${version}`,
};
