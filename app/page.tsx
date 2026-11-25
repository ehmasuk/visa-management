import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { roleHomePath } from "@/lib/routes";

/**
 * No public landing page: `/` is only an entry point that sends each visitor
 * straight to the right place. The proxy normally handles this before render;
 * this shim covers direct server renders.
 */
export default async function Home() {
  const session = await auth();
  redirect(session?.user ? roleHomePath(session.user.role) : "/login");
}
