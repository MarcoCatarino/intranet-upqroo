import path from "node:path";
import fs from "node:fs/promises";

import { env } from "../../config/env.js";

const STORAGE_PATH = env.STORAGE_PATH;

export function getDocumentFolder(documentId: number) {
  const group = Math.floor(documentId / 100);

  return path.join(
    STORAGE_PATH! as string,
    "documents",
    String(group),
    String(documentId),
  );
}

export async function ensureDocumentFolder(documentId: number) {
  const folder = getDocumentFolder(documentId);

  await fs.mkdir(folder, { recursive: true });

  return folder;
}

export function getDocumentVersionPath(
  documentId: number,
  version: number,
  extension: string,
) {
  const folder = getDocumentFolder(documentId);

  return path.join(folder, `v${version}${extension}`);
}
