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
  RECEIVED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  SUBMITTED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
};

/** Tailwind classes for the badge/status timeline dot, keyed by PassportStatus. */
export const STATUS_DOT: Record<string, string> = {
  RECEIVED: "bg-blue-500",
  UNDER_REVIEW: "bg-amber-500",
  SUBMITTED: "bg-purple-500",
  DELIVERED: "bg-emerald-500",
};

/**
 * The passport custody pipeline in stage order. Entry always lands a passport
 * on RECEIVED; stage transitions are exactly one forward step through this
 * list (see updatePassportStatus) and DELIVERED is terminal.
 */
export const STAGES = ["RECEIVED", "UNDER_REVIEW", "SUBMITTED", "DELIVERED"] as const;

export type PassportStage = (typeof STAGES)[number];

/** The stage a passport advances to from its current stage; null = terminal. */
export const NEXT_STAGE: Record<PassportStage, PassportStage | null> = {
  RECEIVED: "UNDER_REVIEW",
  UNDER_REVIEW: "SUBMITTED",
  SUBMITTED: "DELIVERED",
  DELIVERED: null,
};

/** Canonical human-readable labels for the status values. */
const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Received",
  UNDER_REVIEW: "Under Review",
  SUBMITTED: "Submitted",
  DELIVERED: "Delivered",
};

/** "Received" / "Under Review" / "Submitted" / "Delivered" from the enum value. */
export function statusLabel(status: string): string {
  const label = STATUS_LABELS[status];
  if (label) return label;
  return status
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
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
