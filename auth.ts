import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, resolveRegistration } from "@/lib/registry";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  // No database adapter — Prisma adapter is designed for SQL databases.
  // With MongoDB we manage users via Prisma directly in the callbacks below
  // and use JWT sessions.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow-list policy (spec admin/registry): only emails an admin has
      // registered — bootstrap ADMIN, a Staff record, or an Agency record —
      // may sign in. Everyone else is denied.
      if (!user.email) return false;

      try {
        const resolved = await resolveRegistration(user.email);
        if (!resolved) {
          console.warn(`Sign-in denied: ${user.email} is not in the admin registry`);
          return false;
        }

        // Google can deliver emails with different casing than the registry
        // stores; normalize once so lookup and upsert agree on identity.
        const email = normalizeEmail(user.email);

        // Sync the User record (register on first sign-in, refresh otherwise).
        // Role always follows the registry so stale roles are corrected on
        // the next sign-in. ADMIN is only ever assigned from the users
        // collection itself — signIn never mints an extra admin (the
        // single-admin invariant lives in scripts + role-service).
        const dbUser = await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: user.name ?? resolved.name,
            image: user.image ?? null,
            emailVerified: new Date(),
            role: resolved.role,
          },
          update: {
            name: user.name ?? resolved.name,
            image: user.image ?? undefined,
            emailVerified: undefined,
            role: resolved.role,
          },
        });

        // Stamp the Prisma user id onto the NextAuth user so it flows
        // into the JWT callback.
        user.id = dbUser.id;
        user.role = dbUser.role;
        return true;
      } catch (error) {
        console.error("Error resolving registration / creating user:", error);
        return false;
      }
    },

    async jwt({ token, user, account, trigger, session }) {
      // Persist user data to token on sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      // Handle session updates (e.g. updateUser)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },

    async session({ session, token }) {
      // Send token data to session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STAFF" | "AGENCY";
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string | null;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/error",
  },

  debug: process.env.NODE_ENV === "development",
});
