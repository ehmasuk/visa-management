import Link from "next/link";
import { auth } from "@/auth";
import { roleHomePath } from "@/lib/routes";
import { CustodyTerminal } from "@/components/custody-terminal";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  Lock,
  Stamp,
  Truck,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

export default async function Page() {
  const session = await auth();
  const user = session?.user;
  const userRole = user?.role;
  const dashboardHref = userRole ? roleHomePath(userRole) : "/dashboard";

  return (
    <main className="relative min-h-svh flex flex-col justify-between overflow-x-hidden bg-background selection:bg-foreground selection:text-background">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.5_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0_0/0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_70%,transparent_100%)]" />
        {/* Subtle radial ambient warmth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-foreground/[0.025] blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
          >
            <div className="size-9 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-[1.02]">
              <Stamp className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
                Visa Management
                <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                  Operations
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                Passport & Payment Tracking
              </span>
            </div>
          </Link>

          {/* Right Navigation & Status */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Allow-List Active</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />

            {/* User Session Action */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
                >
                  <span>
                    {userRole === "ADMIN"
                      ? "Admin Dashboard"
                      : userRole === "STAFF"
                      ? "Staff Workspace"
                      : "Agency Portal"}
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted shadow-xs"
              >
                <span>Sign in</span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <section className="relative flex-1 flex items-center py-6 sm:py-8 lg:py-12 my-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Authoritative Editorial Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {/* Main Heading (No kicker/eyebrow, heading carries its own weight) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-foreground leading-[1.12]">
                Passport tracking & visa workflow.
              </h1>

              {/* Subheading / Value Proposition */}
              <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[65ch]">
                A role-based web system for visa-processing offices and client
                agencies. Track passports from physical intake through embassy
                processing to delivery, with Gmail allow-lists and payment
                tracking.
              </p>

              {/* Action Area */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {user ? (
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span>
                      Open{" "}
                      {userRole === "ADMIN"
                        ? "Admin Dashboard"
                        : userRole === "STAFF"
                        ? "Staff Workspace"
                        : "Agency Portal"}
                    </span>
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group"
                  >
                    <svg
                      className="size-4 fill-current transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                    <span>Sign in with Google</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}

                <a
                  href="#passport-record"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <FileCheck className="size-4 text-muted-foreground" />
                  <span>View Status Progression</span>
                </a>
              </div>

              {/* Invariants & Trust Signals */}
              <div className="mt-10 pt-8 border-t border-border/60">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="size-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Gmail Allow-List
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Only registered admin, staff, and agency Gmail addresses can sign in.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="size-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Two Collectors
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Intake collector recorded at entry; delivery collector assigned at delivery.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="size-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Auto Timestamps
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Receipt date and delivery date are set by the system, never typed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Passport Record */}
            <div id="passport-record" className="lg:col-span-6 w-full">
              <CustodyTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* Hero Bottom Anchor Bar */}
      <footer className="w-full border-t border-border/60 bg-muted/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              Visa Management
            </span>
            <span>•</span>
            <span>Gmail Allow-List Access</span>
            <span>•</span>
            <span>Bangladeshi Taka (৳) Settlement</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-foreground hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
