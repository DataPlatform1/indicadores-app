export function canSubmit(role: string | undefined) {
  return role === "ADMIN" || role === "EDITOR";
}

export function canViewHistory(role: string | undefined) {
  return role === "ADMIN";
}
