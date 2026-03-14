export interface CreateDocumentInput {
  title: string;
  departmentId: number;
}

export interface UploadDocumentInput {
  documentId: number;
  filePath: string;
  mimeType: string;
}

export interface DocumentPermission {
  userId: string;
  documentId: number;
  role: "viewer" | "editor";
}

export type DocumentRole = "owner" | "editor" | "viewer";

export interface ShareDocumentInput {
  documentId: number;
  userId: string;
  role: DocumentRole;
}
