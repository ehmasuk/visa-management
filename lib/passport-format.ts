/**
 * Passport display formatting shared by the staff/admin card component and
 * the internal passport detail view. Pure formatting only — no data access.
 */

/** Human-readable stamp like "30 Oct 2026, 12:34"; unset dates render as an em dash. */
export function fmt(value: Date | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

/** Tailwind classes for the status badge, keyed by PassportStatus. */
export const STATUS_BADGE: Record<string, string> = {
  RECEIVED: "bg-blue-500/15 text-blue-600",
  DELIVERED: "bg-emerald-500/15 text-emerald-600",
};

/** "Received" / "Delivered" from the status enum value. */
export function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/**
 * Last-editor line for detail views and cards, e.g.
 * "Md. Rahim (Staff) · 30 Oct 2026, 12:34". Renders as an em dash when the
 * passport predates editor stamping.
 */
export function lastEditorLine(
  name: string | null,
  role: string | null,
  editedAt: Date | null
): string {
  if (!name && !role && !editedAt) return "—";
  const roleLabel = role ? role.charAt(0) + role.slice(1).toLowerCase() : "";
  const who = name ? `${name}${roleLabel ? ` (${roleLabel})` : ""}` : roleLabel;
  return `${who} · ${fmt(editedAt)}`;
}
