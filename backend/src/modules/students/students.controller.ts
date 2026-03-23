import { Request, Response } from "express";
import fs from "node:fs/promises";
import {
  uploadCsvSchema,
  departmentEnrollmentsSchema,
} from "./students.validators.js";
import {
  importEnrollmentsFromCsv,
  getEnrollmentsByDepartment,
} from "./students.service.js";

const MAX_CSV_SIZE = 500 * 1024;

export async function uploadCsvController(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Se requiere un archivo CSV" });
  }

  if (file.size > MAX_CSV_SIZE) {
    await fs.unlink(file.path).catch(() => null);
    return res.status(400).json({
      message: "El archivo supera el límite de 500 KB",
    });
  }

  const ext = file.originalname.split(".").pop()?.toLowerCase();
  if (ext !== "csv") {
    await fs.unlink(file.path).catch(() => null);
    return res.status(400).json({
      message: "Solo se permiten archivos .csv",
    });
  }

  const { departmentId } = uploadCsvSchema.parse(req.body);

  let csvContent: string;
  try {
    csvContent = await fs.readFile(file.path, "utf-8");
  } catch {
    await fs.unlink(file.path).catch(() => null);
    return res.status(500).json({ message: "Error al leer el archivo" });
  } finally {
    await fs.unlink(file.path).catch(() => null);
  }

  const result = await importEnrollmentsFromCsv(
    csvContent,
    departmentId,
    req.user!.id,
  );

  res.json({
    message: "Padrón importado correctamente",
    inserted: result.inserted,
    skipped: result.skipped,
    invalid: result.invalid.length > 0 ? result.invalid : undefined,
    departmentId: result.departmentId,
  });
}

export async function listEnrollmentsController(req: Request, res: Response) {
  const { departmentId } = departmentEnrollmentsSchema.parse(req.params);

  const { enrollments, total } = await getEnrollmentsByDepartment(departmentId);

  res.json({ enrollments, total, departmentId });
}
