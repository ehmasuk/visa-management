// Adapted from Login 3 from Hirael <https://hirael.com/blocks/auth/login-03>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael
// Changes: Google OAuth, Visa Management branding/copy, real server action,
// admin re-auth notice, and the project's Button/token primitives.

"use client";

import * as React from "react";
import { Loader2, Stamp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const ENTER =
  "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] fill-mode-both motion-reduce:animate-none";

const stagger = (index: number, step = 60): React.CSSProperties => ({
  animationDelay: `${index * step}ms`,
});

/** Four-colour Google mark from the supplied button. */
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const jitter = (i: number) => {
  const value = Math.sin(i + 1) * 10_000;
  return value - Math.floor(value);
};

const FloatingPaths = ({ position }: { position: number }) => {
  const reduceMotion = useReducedMotion();
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-primary"
        fill="none"
        viewBox="0 0 696 316"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            initial={{ pathLength: 0.3 }}
            animate={
              reduceMotion
                ? undefined
                : { pathLength: 1, pathOffset: [0, 1, 0] }
            }
            stroke="currentColor"
            className="opacity-60"
            strokeOpacity={0.1 + path.id * 0.03}
            strokeWidth={path.width}
            transition={{
              duration: 20 + jitter(path.id) * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export function Login03({
  onContinue,
  needsReauth = false,
}: {
  /** Server action that starts (or renews) the Google sign-in. */
  onContinue: () => Promise<void>;
  needsReauth?: boolean;
}) {
  const [redirecting, setRedirecting] = React.useState(false);

  const handleContinue = async () => {
    setRedirecting(true);
    try {
      await onContinue();
    } catch {
      // A failed navigation leaves the button usable; the server action has
      // already flashed/redirected on its own success path.
      setRedirecting(false);
    }
  };

  return (
    <section
      data-slot="login"
      className="relative min-h-svh overflow-hidden bg-background lg:grid lg:grid-cols-2"
    >
      <aside
        data-slot="login-aside"
        className="relative hidden h-full flex-col overflow-hidden border-e border-border bg-card p-10 lg:flex"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent, transparent, var(--background))",
          }}
        />

        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        <div className={cn(ENTER, "relative z-10 flex items-center gap-2")}>
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stamp className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-[-0.025em]">
              Visa Management
            </span>
            <span className="text-xs text-muted-foreground">
              Operations
            </span>
          </div>
        </div>

        <div
          style={stagger(4)}
          className={cn(ENTER, "relative z-10 mt-auto flex flex-col gap-3")}
        >
          <p className="font-serif text-2xl leading-[1.25] tracking-tight md:text-3xl">
            Passport custody, visa workflow and settlement —{" "}
            <span className="italic text-foreground">one governed workspace</span>.
          </p>
          <p className="text-xs uppercase text-muted-foreground">
            Registry-gated access · Chain of custody · Payment ledger
          </p>
        </div>
      </aside>

      <div
        data-slot="login-main"
        className="relative flex min-h-svh flex-col justify-center px-8 lg:min-h-0"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-60"
        >
          <div
            className="absolute end-0 top-0 h-320 w-140 -translate-y-88 rounded-full"
            style={{
              background:
                "radial-gradient(68.54% 68.72% at 55.02% 31.46%, color-mix(in oklch, var(--foreground) 6%, transparent) 0, color-mix(in oklch, var(--foreground) 2%, transparent) 50%, color-mix(in oklch, var(--foreground) 1%, transparent) 80%)",
            }}
          />
          <div
            className="absolute end-0 top-0 h-320 w-60 translate-x-[5%] -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, color-mix(in oklch, var(--foreground) 4%, transparent) 0, color-mix(in oklch, var(--foreground) 1%, transparent) 80%, transparent 100%)",
            }}
          />
        </div>

        <div
          data-slot="login-panel"
          className="relative z-10 mx-auto w-full space-y-6 sm:max-w-sm"
        >
          <div className={cn(ENTER, "flex items-center gap-2 lg:hidden")}>
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Stamp className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-[-0.025em]">
              Visa Management
            </span>
          </div>

          <div data-slot="login-header" className="flex flex-col gap-2">
            <h1
              style={stagger(1)}
              className={cn(
                ENTER,
                "font-serif text-4xl font-medium tracking-tight sm:text-5xl",
              )}
            >
              Sign in to your workspace.
            </h1>
            <p
              style={stagger(2)}
              className={cn(ENTER, "text-sm text-muted-foreground")}
            >
              One click with the Google account your administrator registered.
            </p>
            {needsReauth && (
              <p
                style={stagger(2)}
                className={cn(
                  ENTER,
                  "text-sm font-medium text-amber-600 dark:text-amber-400"
                )}
              >
                Your admin session has expired. Please sign in again to continue.
              </p>
            )}
          </div>

          <div style={stagger(3)} className={ENTER}>
            <button
              type="button"
              disabled={redirecting}
              onClick={handleContinue}
              className={cn(
                "relative isolate inline-flex h-11 w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-md border-2 border-foreground bg-card px-4 text-sm font-semibold text-foreground",
                "shadow-[4px_4px_0_var(--foreground)] transition-all duration-[250ms]",
                "hover:text-background active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--foreground)]",
                "before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-0 before:bg-foreground before:transition-[width] before:duration-[250ms] hover:before:w-full",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              {redirecting ? (
                <Loader2 aria-hidden className="relative z-10 size-5 animate-spin" />
              ) : (
                <GoogleIcon className="relative z-10 size-6" />
              )}
              <span className="relative z-10">
                {redirecting
                  ? "Redirecting to Google…"
                  : needsReauth
                    ? "Sign in again"
                    : "Continue with Google"}
              </span>
            </button>
            <span role="status" className="sr-only">
              {redirecting ? "Redirecting to Google" : ""}
            </span>
          </div>

          <p
            style={stagger(4)}
            className={cn(ENTER, "text-xs text-muted-foreground")}
          >
            Access is limited to registered staff and administrators.
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </section>
  );
}
