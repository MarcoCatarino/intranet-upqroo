export function validateInstitutionEmail(email: string) {
  if (!email.endsWith("@upqroo.edu.mx")) {
    throw new Error("Unauthorized email domain");
  }
}
