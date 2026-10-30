import Link from "next/link";
import { signOut } from "@/auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Stamp, LogOut } from "lucide-react";

export type NavItem = { href: string; label: string };

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/passports", label: "Passports" },
  { href: "/admin/agencies", label: "Agencies" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/collectors", label: "Collectors" },
  { href: "/admin/visa-types", label: "Visa Types" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/reports", label: "Reports" },
];

const STAFF_ITEMS: NavItem[] = [
  { href: "/staff", label: "Overview" },
  { href: "/staff/passports", label: "Passports" },
  { href: "/staff/payments", label: "Payments" },
];

const AGENCY_ITEMS: NavItem[] = [{ href: "/agency", label: "My Passports" }];

export function itemsForRole(role: string): NavItem[] {
  if (role === "ADMIN") return ADMIN_ITEMS;
  if (role === "STAFF") return STAFF_ITEMS;
  if (role === "AGENCY") return AGENCY_ITEMS;
  return [];
}

/**
 * Shared top navigation for signed-in role areas (server component).
 */
export function RoleNav({
  pathname,
  role,
  userLabel,
}: {
  pathname: string;
  role: "ADMIN" | "STAFF" | "AGENCY";
  userLabel?: string | null;
}) {
  // Admin routes now use shadcn Sidebar layout
  if (role === "ADMIN") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-foreground hover:opacity-90 transition-opacity"
            title="Go to Homepage"
          >
            <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground flex items-center justify-center font-bold shadow-xs">
              <Stamp className="size-4" />
            </div>
            <span className="hidden sm:inline">Visa Management</span>
          </Link>

          <nav className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            {itemsForRole(role).map((item) => {
              const isActive =
                item.href === "/admin" || item.href === "/staff" || item.href === "/agency"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {userLabel ? (
            <span className="hidden md:inline text-xs text-muted-foreground font-mono truncate max-w-[200px]">
              {userLabel}
            </span>
          ) : null}

          <Badge
            className={cn(
              "font-mono text-[10px] tracking-wider uppercase px-2.5 py-0.5 font-bold",
              role === "AGENCY"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            )}
          >
            {role}
          </Badge>

          <ThemeToggle className="text-muted-foreground hover:text-foreground size-8" />

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 cursor-pointer rounded-xl gap-1.5"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}
