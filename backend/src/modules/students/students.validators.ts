import { z } from "zod";

export const MATRICULA_REGEX = /^\d{6,10}$/;

export const uploadCsvSchema = z.object({
  departmentId: z.coerce.number().int().positive(),
});

export const departmentEnrollmentsSchema = z.object({
  departmentId: z.coerce.number().int().positive(),
});

export function parseMatriculasFromCsv(rawContent: string): {
  valid: string[];
  invalid: string[];
  skipped: number;
} {
  const lines = rawContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];
  let skipped = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower === "matricula" ||
      lower === "matrícula" ||
      lower === "matriculas" ||
      lower === "matrícula alumno" ||
      lower === "no. control"
    ) {
      skipped++;
      continue;
    }

    const value = line.split(",")[0].trim();

    if (MATRICULA_REGEX.test(value)) {
      if (!valid.includes(value)) {
        valid.push(value);
      } else {
        skipped++;
      }
    } else {
      invalid.push(value);
    }
  }

  return { valid, invalid, skipped };
}
