import Link from "next/link";

export const metadata = { title: "Access denied" };

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Access denied</h1>
          <p className="text-muted-foreground">
            Your account's role does not have access to that area of the visa
            management system.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
        >
          Go to your workspace
        </Link>
      </div>
    </div>
  );
}
