"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";

/**
 * Consumes the one-shot flash cookie written by server actions via setFlash
 * (lib/flash.ts) and shows it as a shadcn toast, then clears the cookie.
 *
 * The root layout keys this component with a fresh per-request value, so it
 * remounts after every server-rendered navigation — including a server-action
 * redirect back to the SAME page — making sure no flash is ever missed.
 */
export function FlashToaster() {
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)flash=([^;]*)/);
    if (!match) return;
    document.cookie = "flash=; path=/; max-age=0";

    let payload: string;
    try {
      payload = decodeURIComponent(match[1]);
    } catch {
      return;
    }
    const separator = payload.indexOf(":");
    if (separator <= 0) return;

    const type = payload.slice(0, separator);
    if (type !== "success" && type !== "warning" && type !== "error") return;

    let message: string;
    try {
      message = decodeURIComponent(payload.slice(separator + 1));
    } catch {
      message = payload.slice(separator + 1);
    }
    toast.add({ title: message, type });
  }, []);

  return null;
}
