import { DefaultSession } from "next-auth";

declare module "next-auth" {
  type Role = "ADMIN" | "STAFF" | "REVOKED";

  interface Session {
    user: {
      id: string;
      role: Role;
      email: string;
      name?: string | null;
      image?: string | null;
      /** Unix seconds of the last real sign-in; anchors admin re-auth cap. */
      authAt?: number;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  type JwtRole = "ADMIN" | "STAFF" | "REVOKED";

  interface JWT {
    id?: string;
    role?: JwtRole;
    email?: string;
    name?: string | null;
    image?: string | null;
    authAt?: number;
  }
}
