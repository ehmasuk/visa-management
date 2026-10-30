import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="rounded-xl bg-card p-8 md:p-12 ring-1 ring-foreground/10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Visa Management
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[65ch] mx-auto mb-8">
            Passport intake, delivery, and payment tracking for agencies,
            staff, and admin. Registry-gated custody with chain-of-custody
            tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in to continue
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Only addresses allow-listed by the administrator can sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
