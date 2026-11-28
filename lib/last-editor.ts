import type { Session } from "next-auth";

/**
 * Last-editor stamp shared by every internal passport write (entry, details,
 * status, payment). Denormalized onto the passport so attribution stays
 * readable without a join and reflects the acting user at mutation time.
 */
export function lastEditorStamp(session: Session) {
  return {
    lastEditedByRole: session.user.role,
    lastEditedByName: session.user.name ?? session.user.email ?? "",
    lastEditedByEmail: session.user.email ?? "",
    lastEditedAt: new Date(),
  };
}
