import { DefaultSession } from "next-auth";

declare module "next-auth" {
  type Role = "ADMIN" | "STAFF" | "AGENCY";

  interface Session {
    user: {
      id: string;
      role: Role;
      email: string;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  type JwtRole = "ADMIN" | "STAFF" | "AGENCY";

  interface JWT {
    id?: string;
    role?: JwtRole;
    email?: string;
    name?: string | null;
    image?: string | null;
  }
}
