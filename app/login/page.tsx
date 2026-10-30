import Link from "next/link";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Stamp, ShieldCheck, ArrowLeft, Lock } from "lucide-react";

export const metadata = { title: "Sign In — Visa Management" };

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
    <div className="relative min-h-svh flex flex-col items-center justify-center p-4 sm:p-6 bg-background overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Bar Navigation */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle className="text-muted-foreground hover:text-foreground size-8" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl text-center">
          {/* Logo Medallion */}
          <div className="mx-auto size-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground flex items-center justify-center font-bold shadow-md mb-6">
            <Stamp className="size-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Visa Management
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Official Passport Custody & Settlement Portal
          </p>

          {/* Sign In Action */}
          <form action={handleSignIn} className="mt-8">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-3.5 px-4 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Security Notice */}

        </div>


      </div>
    </div>
  );
}
