import NextAuth, { type Role } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, resolveRegistration } from "@/lib/registry";

/**
 * The session callback runs in the proxy, in layouts and in every action —
 * often several times per request. Cache the registry answer briefly so a
 * single user lookup is shared instead of repeating the same Prisma query.
 * Sign-in always uses resolveRegistration directly (no cache).
 */
const SESSION_REGISTRATION_TTL_MS = 30 * 1000;
const sessionRegistrations = new Map<
  string,
  { at: number; value: Awaited<ReturnType<typeof resolveRegistration>> }
>();

async function registrationForSession(email: string) {
  const key = email.trim().toLowerCase();
  const hit = sessionRegistrations.get(key);
  if (hit && Date.now() - hit.at < SESSION_REGISTRATION_TTL_MS) {
    return hit.value;
  }
  const value = await resolveRegistration(email);
  if (sessionRegistrations.size > 500) sessionRegistrations.clear();
  sessionRegistrations.set(key, { at: Date.now(), value });
  return value;
}

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
    // JWT sessions are re-signed on every auth() call, so activity keeps
    // extending this window indefinitely. 24h bounds the rolling window;
    // requireAdmin() additionally enforces a hard re-auth cap for admins.
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow-list policy (spec admin/registry): only the bootstrap ADMIN
      // and emails in the Staff registry may sign in. Everyone else is denied.
      if (!user.email) return false;

      try {
        const resolved = await resolveRegistration(user.email);
        if (!resolved) return false;

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
      } catch {
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
        // Anchors the hard re-auth cap enforced by requireAdmin().
        token.authAt = Math.floor(Date.now() / 1000);
      }

      // Handle session updates (e.g. updateUser)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token) return session;

      // The registry / admin recovery can change a role (or remove access)
      // while a JWT is still alive. Re-check on every session read so a
      // demoted admin or an offboarded user loses access immediately.
      if (token.email) {
        let registration: Awaited<ReturnType<typeof resolveRegistration>> = null;
        let checked = false;
        try {
          registration = await registrationForSession(token.email);
          checked = true;
        } catch {
          // A transient DB outage must not permanently revoke sessions;
          // every guarded action hits the DB again before returning data.
        }

        if (checked) {
          if (!registration || token.role === "REVOKED") {
            // REVOKED is sticky: a previously removed account must sign in
            // again rather than being silently restored by a registry edit.
            token.role = "REVOKED";
          } else if (registration.role !== token.role) {
            token.role = registration.role;
          }
        }
      }

      session.user.id = token.id as string;
      session.user.role = (token.role as Role | undefined) ?? "REVOKED";
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.image = token.image as string | null;
      session.user.authAt = token.authAt as number | undefined;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/") && !url.startsWith("//")) {
        return `${baseUrl}${url}`;
      }
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Malformed callbackUrl — fall back to the site root.
      }
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/error",
  },

  debug: process.env.NODE_ENV === "development",
});
