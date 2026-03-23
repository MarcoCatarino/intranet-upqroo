import { db } from "../../infrastructure/database/drizzle.js";
import { eq, and, sql } from "drizzle-orm";
import { studentEnrollments } from "../../infrastructure/database/schema/student_enrollments.schema.js";

export async function replaceEnrollments(
  departmentId: number,
  matriculas: string[],
  uploadedBy: string,
) {
  await db.transaction(async (tx) => {
    await tx
      .delete(studentEnrollments)
      .where(eq(studentEnrollments.departmentId, departmentId));

    if (matriculas.length > 0) {
      await tx.insert(studentEnrollments).values(
        matriculas.map((matricula) => ({
          matricula,
          departmentId,
          uploadedBy,
        })),
      );
    }
  });
}

export async function findDepartmentByMatricula(matricula: string) {
  const result = await db
    .select({ departmentId: studentEnrollments.departmentId })
    .from(studentEnrollments)
    .where(eq(studentEnrollments.matricula, matricula))
    .limit(1);

  return result[0]?.departmentId ?? null;
}

export async function listEnrollmentsByDepartment(departmentId: number) {
  return db
    .select({
      matricula: studentEnrollments.matricula,
      uploadedBy: studentEnrollments.uploadedBy,
      updatedAt: studentEnrollments.updatedAt,
    })
    .from(studentEnrollments)
    .where(eq(studentEnrollments.departmentId, departmentId));
}

export async function countEnrollmentsByDepartment(
  departmentId: number,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(studentEnrollments)
    .where(eq(studentEnrollments.departmentId, departmentId));

  return result[0]?.count ?? 0;
}

export async function isMatriculaEnrolled(
  matricula: string,
  departmentId: number,
): Promise<boolean> {
  const result = await db
    .select({ matricula: studentEnrollments.matricula })
    .from(studentEnrollments)
    .where(
      and(
        eq(studentEnrollments.matricula, matricula),
        eq(studentEnrollments.departmentId, departmentId),
      ),
    )
    .limit(1);

  return result.length > 0;
}