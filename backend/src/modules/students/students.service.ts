import {
  replaceEnrollments,
  findDepartmentByMatricula,
  listEnrollmentsByDepartment,
  countEnrollmentsByDepartment,
} from "./students.repository.js";
import { parseMatriculasFromCsv } from "./students.validators.js";

const MAX_ENROLLMENTS_PER_CSV = 2000;

export interface CsvImportResult {
  inserted: number;
  invalid: string[];
  skipped: number;
  departmentId: number;
}

export async function importEnrollmentsFromCsv(
  csvContent: string,
  departmentId: number,
  uploadedBy: string,
): Promise<CsvImportResult> {
  const { valid, invalid, skipped } = parseMatriculasFromCsv(csvContent);

  if (valid.length === 0 && invalid.length === 0) {
    throw new Error("El archivo CSV está vacío o no contiene matrículas");
  }

  if (valid.length > MAX_ENROLLMENTS_PER_CSV) {
    throw new Error(
      `El CSV supera el límite de ${MAX_ENROLLMENTS_PER_CSV} matrículas por importación`,
    );
  }

  await replaceEnrollments(departmentId, valid, uploadedBy);

  return {
    inserted: valid.length,
    invalid,
    skipped,
    departmentId,
  };
}

export async function resolveStudentDepartment(
  matricula: string,
): Promise<number | null> {
  return findDepartmentByMatricula(matricula);
}

export async function getEnrollmentsByDepartment(departmentId: number) {
  const [enrollments, total] = await Promise.all([
    listEnrollmentsByDepartment(departmentId),
    countEnrollmentsByDepartment(departmentId),
  ]);

  return { enrollments, total };
}
