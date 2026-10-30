import Link from "next/link";
import { auth } from "@/auth";
import { roleHomePath } from "@/lib/routes";
import { CustodyTerminal } from "@/components/custody-terminal";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  FileCheck,
  Stamp,
} from "lucide-react";

export default async function Page() {
  const session = await auth();
  const user = session?.user;
  const userRole = user?.role;
  const dashboardHref = userRole ? roleHomePath(userRole) : "/dashboard";

  return (
    <main className="relative min-h-svh flex flex-col justify-between overflow-x-hidden bg-background">
      {/* Ambient background glow accents */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-primary/10 via-blue-500/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
          >
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <Stamp className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-2">
                Visa Management
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Operations
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                Passport Custody & Settlement
              </span>
            </div>
          </Link>

          {/* Right Navigation & Status */}
          <div className="flex items-center gap-3">


            {/* Light / Dark Mode Toggle */}
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />

            {/* User Session Action */}
            {user ? (
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
              >
                <span>
                  {userRole === "ADMIN"
                    ? "Admin Portal"
                    : userRole === "STAFF"
                    ? "Staff Workspace"
                    : "Agency Portal"}
                </span>
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
              >
                <span>Sign In</span>
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacious Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Registry-Gated Passport Operations</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              Passport custody and visa workflow, <span className="text-primary">simplified</span>.
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              An enterprise operations system for visa-processing agencies. Track passports from physical counter intake through embassy clearance to final courier delivery with verified Gmail allow-lists and ৳ payment settlement.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02]"
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
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02] group"
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
                href="#interactive-terminal"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted shadow-xs"
              >
                <FileCheck className="size-4 text-primary" />
                <span>Explore Live Console</span>
              </a>
            </div>

            {/* 3 Pillar Signals */}
            <div className="mt-12 pt-8 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Gmail Allow-List
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Strict identity gating: only registered Admin, Staff, and Agencies can sign in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                  <Truck className="size-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Dual Collector Chain
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Intake courier recorded at entry; separate delivery courier assigned at completion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <CreditCard className="size-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    ৳ Settlement Control
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Agency payment requests on delivered passports, audited and approved by staff.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
