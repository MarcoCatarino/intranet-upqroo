export interface CreateDocumentInput {
  title: string;
  description?: string;
  departmentId: number;
}

export interface UploadDocumentInput {
  documentId: number;
  filePath: string;
  mimeType: string;
}

export type DocumentPermissionType =
  | "view"
  | "download"
  | "upload_version"
  | "edit"
  | "share";

export interface DocumentPermission {
  userId?: string;
  departmentId?: number;
  documentId: number;
  permission: DocumentPermissionType;
}

export interface ShareDocumentInput {
  documentId: number;
  userId?: string;
  departmentId?: number;
  permission: DocumentPermissionType;
}
