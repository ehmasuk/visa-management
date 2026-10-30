import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { callbackUrl = "/dashboard" } = await searchParams;

  async function handleSignIn() {
    "use server";
    await signIn("google", { callbackUrl: callbackUrl as string });
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground">Continue with your Google account</p>
        </div>
        <form action={handleSignIn} className="space-y-4">
          <Button type="submit" variant="outline" className="w-full">
            Sign in with Google
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          Google is the only sign-in provider. Only addresses registered by
          the administrator can sign in.
        </p>
      </div>
    </div>
  );
}
