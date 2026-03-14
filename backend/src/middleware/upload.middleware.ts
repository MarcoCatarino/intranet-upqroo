import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const TMP_DIR = "tmp/uploads";

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

function fileFilter(_req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files allowed"), false);
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
