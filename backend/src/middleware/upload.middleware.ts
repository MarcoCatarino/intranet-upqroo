import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import type { Request } from "express";
import type { FileFilterCallback } from "multer";

import { env } from "../config/env.js";

if (!env.TMP_PATH) {
  throw new Error("TMP_PATH not configured");
}

const TMP_DIR = env.TMP_PATH as string;

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TMP_DIR);
  },

  filename: (_req, file, cb) => {
    const unique = "tmp-" + Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, unique + ext);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files allowed"));
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
