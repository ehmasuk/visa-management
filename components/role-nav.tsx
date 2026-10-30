import Link from "next/link";
import { signOut } from "@/auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type NavItem = { href: string; label: string };

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/passports", label: "Passports" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/agencies", label: "Agencies" },
  { href: "/admin/collectors", label: "Collectors" },
  { href: "/admin/staff", label: "Staff" },
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
  return (
    <header className="border-b border-sidebar-border bg-sidebar">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
        <span className="text-sm font-semibold text-sidebar-foreground">
          Visa Management
        </span>
        <nav className="flex flex-wrap gap-1">
          {itemsForRole(role).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {userLabel ? (
            <span className="text-xs text-sidebar-foreground/70">{userLabel}</span>
          ) : null}
          <Badge variant="secondary">{role}</Badge>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="xs">
              Sign out
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
