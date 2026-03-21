import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import type { Request } from "express";
import type { FileFilterCallback } from "multer";

import { env } from "../config/env.js";

if (!env.TMP_PATH) {
  throw new Error("TMP_PATH not configured");
}

const TMP_DIR = env.TMP_PATH;

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const allowedExtensions = [".pdf", ".docx", ".xlsx", ".pptx"];

export const FILE_TYPE_META: Record<string, { label: string; color: string }> =
  {
    ".pdf": { label: "PDF", color: "red" },
    ".docx": { label: "Word", color: "blue" },
    ".xlsx": { label: "Excel", color: "green" },
    ".pptx": { label: "PowerPoint", color: "orange" },
  };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TMP_DIR);
  },

  filename: (_req, file, cb) => {
    const unique = `tmp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, unique + ext);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  const mime = file.mimetype;
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(mime)) {
    return cb(
      new Error(
        "Tipo de archivo no permitido. Solo PDF, Word, Excel y PowerPoint",
      ),
    );
  }

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Extensión no permitida"));
  }

  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
