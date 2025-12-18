import type { DecodedIdToken } from "firebase-admin/auth";

// Por ahora usamos un claim booleano simple: customClaim "admin_deportes": true
// Lo podés setear desde un script o Cloud Function en Firebase Admin.

export const isAdminDeportes = (token: DecodedIdToken | null): boolean => {
  if (!token) return false;
  return token.admin_deportes === true || token.role === "admin_deportes";
};


