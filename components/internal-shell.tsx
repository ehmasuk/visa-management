import { signOut } from "@/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StaffSidebar } from "@/components/staff-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut } from "lucide-react";

/**
 * Shared shell for internal pages that live outside /admin and /staff
 * (for example the passport edit view). Shows the matching sidebar and a
 * sticky header with sign-out for STAFF or ADMIN.
 */
export async function InternalShell({
  role,
  email,
  children,
}: {
  role: string;
  email: string;
  children: React.ReactNode;
}) {
  const isAdmin = role === "ADMIN";

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <SidebarProvider>
      {isAdmin ? <AdminSidebar /> : <StaffSidebar />}
      <SidebarInset className="min-h-svh flex flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs font-bold text-foreground tracking-tight">
              {isAdmin ? "Admin Governance Portal" : "Staff Operations Desk"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                {email}
              </span>
            </div>

            <ThemeToggle className="text-muted-foreground hover:text-foreground size-8" />

            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 rounded-xl gap-1.5 cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </header>

        <div className="flex-1 w-full min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
