import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import compression from "compression";
import cluster from "node:cluster";
import os from "node:os";

import { db } from "./infrastructure/database/drizzle.js";

import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import documentRoutes from "./modules/documents/documents.routes.js";
import studentsRoutes from "./modules/students/students.routes.js";

dotenv.config();

const WORKERS = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} running`);
  console.log(`Spawning ${WORKERS} workers...`);

  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.warn(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`,
    );
    cluster.fork();
  });
} else {
  const app = express();

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );

      if (req.method === "OPTIONS") {
        return res.sendStatus(204);
      }

      return next();
    }

    if (req.method === "OPTIONS") {
      return res.status(403).json({ message: "Origin not allowed" });
    }

    if (!origin) {
      return next();
    }

    return res.status(403).json({ message: "Origin not allowed" });
  });

  app.use(compression({ threshold: 1024 }));
  app.use(express.json());
  app.use(cookieParser());

  app.use("/auth", authRoutes);
  app.use("/users", usersRoutes);
  app.use("/documents", documentRoutes);
  app.use("/students", studentsRoutes);

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      pid: process.pid,
      worker: cluster.worker?.id,
    });
  });

  app.get("/db-test", async (req, res) => {
    const result = await db.execute("SELECT 1");
    res.json(result);
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
