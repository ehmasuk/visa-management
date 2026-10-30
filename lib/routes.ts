/**
 * Role → home route mapping. Imported by proxy.ts (Edge runtime) for
 * post-login redirects and by /dashboard shim. Must stay free of server
 * (node-only) imports.
 */
export const ROLE_HOME: Record<"ADMIN" | "STAFF" | "AGENCY", string> = {
  ADMIN: "/admin",
  STAFF: "/staff",
  AGENCY: "/agency",
};

export function roleHomePath(role?: string | null) {
  if (role && role in ROLE_HOME) {
    return ROLE_HOME[role as "ADMIN" | "STAFF" | "AGENCY"];
  }
  return "/login";
}
