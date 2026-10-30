"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";

/**
 * Auth.js error landing page (configured as pages.error in auth.ts).
 * Auth.js appends an error CODE as ?error=... to this page's URL — codes are
 * surfaced only as toast + page text, and the parameter is stripped so no
 * message stays in the address bar.
 */
export default function ErrorPage() {
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (!code) return;
    if (window.location.search !== "") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (code === "AccessDenied") {
      setDenied(true);
      toast.add({
        title:
          "This Google account is not registered for the visa management system. Only addresses allow-listed by the administrator can sign in.",
        type: "warning",
      });
    } else {
      toast.add({
        title: "Something went wrong during sign-in. Please try again.",
        type: "error",
      });
    }
  }, []);

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
