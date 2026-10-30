import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { roleHomePath } from "@/lib/routes";

// Legacy entry point: forwards to the user's role home
// (ADMIN → /admin, STAFF → /staff, AGENCY → /agency). The proxy normally
// handles this before rendering; this shim covers direct server render.
export default async function DashboardPage() {
  const session = await auth();
  redirect(roleHomePath(session?.user?.role));
}
