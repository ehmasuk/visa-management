import { requireStaff } from "@/lib/guards";
import { StaffSidebar } from "@/components/staff-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/auth";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <SidebarProvider>
      <StaffSidebar
        userEmail={session.user.email}
        userName={session.user.name}
        onSignOut={handleSignOut}
      />
      <SidebarInset className="min-h-svh flex flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs font-semibold text-foreground tracking-tight">
              Staff Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              {session.user.email}
            </span>
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" title="Online" />
          </div>
        </header>

        <div className="flex-1 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
