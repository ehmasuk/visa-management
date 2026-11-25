import { signIn, signOut } from "@/auth";
import { Login03 } from "@/components/login-03";

export const metadata = { title: "Sign In — Visa Management" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { callbackUrl = "/dashboard", reauth } = await searchParams;
  const needsReauth = reauth === "1";

  async function handleSignIn() {
    "use server";
    const redirectTo = callbackUrl as string;
    if (needsReauth) {
      // Clear the expired admin session, then force Google to ask for a real
      // sign-in instead of silently reusing its still-active SSO session.
      await signOut({ redirect: false });
      await signIn("google", { redirectTo }, { prompt: "login" });
      return;
    }
    await signIn("google", { redirectTo });
  }

  return <Login03 onContinue={handleSignIn} needsReauth={needsReauth} />;
}
