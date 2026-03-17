import { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export function validateInstitutionEmail(email: string) {
  if (!email.endsWith("@upqroo.edu.mx")) {
    throw new Error("Unauthorized email domain");
  }
}

/**
 * Asigna rol automáticamente según el email institucional.
 * El orden importa: admin y secretary se evalúan primero.
 */
export function resolveRoleFromEmail(email: string): UserRole {
  const local = email.split("@")[0].toLowerCase();

  // Admins
  const adminEmails = ["sistemas"];
  if (adminEmails.includes(local)) return "admin";

  const secretaryEmails = [
    "secretaria.academica",
    "sec.admin",
    "planeacion",
    "vinculacion",
  ];
  if (secretaryEmails.includes(local)) return "secretary";

  const directorEmails = [
    "ing.biotecnologia",
    "ing.software",
    "lic.terapiafisica",
    "ing.biomedica",
    "ing.financiera",
    "lic.gestion",
    "serv.escolares",
    "rec.financieros",
    "rec.humanos",
    "rec.materiales",
    "serv.generales",
    "calidad",
    "estadistica",
    "gestionempresarial",
    "prensaydifusion",
    "coordinaciondeportiva",
    "maria.vidal",
  ];
  if (directorEmails.includes(local)) return "director";

  if (/^\d+$/.test(local)) return "student";

  return "professor";
}
