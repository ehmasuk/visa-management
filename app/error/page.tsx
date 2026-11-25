"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";

/**
 * Auth.js error landing page (configured as pages.error in auth.ts).
 * Auth.js appends an error CODE as ?error=... to this page's URL — codes are
 * surfaced only as toast + page text, and the parameter is stripped so no
 * message stays in the address bar.
 */
export default function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const code = use(searchParams).error;
  const errorCode = Array.isArray(code) ? code[0] : code;

  // Lock the outcome on the first render: stripping the query string below
  // would otherwise flip the page back to the generic message on a re-render.
  const [denied] = useState(() => errorCode === "AccessDenied");
  const notified = useRef(false);

  useEffect(() => {
    if (notified.current) return;
    notified.current = true;

    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    toast.add(
      denied
        ? {
            title:
              "This Google account is not registered for the visa management system. Only addresses allow-listed by the administrator can sign in.",
            type: "warning",
          }
        : {
            title: "Something went wrong during sign-in. Please try again.",
            type: "error",
          }
    );
  }, [denied]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {denied ? "Access denied" : "Sign-in error"}
          </h1>
          <p className="text-muted-foreground">
            {denied
              ? "This Google account is not registered for the visa management system. Only addresses allow-listed by the administrator can sign in."
              : "Something went wrong during sign-in. Please try again."}
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
