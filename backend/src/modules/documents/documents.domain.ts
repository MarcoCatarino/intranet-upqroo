export function canEditDocument(role: string) {
  return role === "owner" || role === "editor";
}

export function canViewDocument(role: string) {
  return role === "owner" || role === "editor" || role === "viewer";
}
