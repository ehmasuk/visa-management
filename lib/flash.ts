import { cookies } from "next/headers";

/**
 * One-shot flash cookie for feedback (errors / warnings / success) produced by
 * server actions right before their redirect. Messages are deliberately NOT
 * placed in the URL query string — the client <FlashToaster> (root layout)
 * consumes this cookie after the redirect, shows a shadcn toast, and clears it.
 */

// Keep in sync with components/flash-toaster.tsx.
export const FLASH_COOKIE = "flash";

export type FlashType = "success" | "warning" | "error";

/**
 * Queue a toast to be shown after the action's redirect.
 * Must be called before redirect() from a server action / route handler.
 */
export async function setFlash(type: FlashType, message: string): Promise<void> {
  const jar = await cookies();
  jar.set(FLASH_COOKIE, `${type}:${encodeURIComponent(message)}`, {
    path: "/",
    // FlashToaster must read + clear it in the browser.
    httpOnly: false,
    sameSite: "lax",
    maxAge: 90,
  });
}
