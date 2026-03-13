import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { db } from "./infrastructure/database/drizzle.js";
import authRoutes from "./modules/auth/auth.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-test", async (req, res) => {
  const result = await db.execute("SELECT 1");

  res.json(result);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
