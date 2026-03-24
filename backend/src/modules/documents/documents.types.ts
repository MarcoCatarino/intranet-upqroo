export type TargetAudience = "all" | "professors" | "students";

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
  departmentId?: number;
  documentId: number;
  permission: DocumentPermissionType;
  targetAudience?: TargetAudience;
}

export interface ShareDocumentInput {
  documentId: number;
  departmentId: number;
  permission: DocumentPermissionType;
  targetAudience: TargetAudience;
}
