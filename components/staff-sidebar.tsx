"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Stamp,
  LayoutDashboard,
  FileText,
  ReceiptText,
} from "lucide-react";

interface StaffSidebarProps {
  userEmail?: string | null;
  userName?: string | null;
}

export function StaffSidebar({
  userEmail,
  userName,
}: StaffSidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    {
      title: "Overview",
      href: "/staff",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Passports",
      href: "/staff/passports",
      icon: FileText,
    },
    {
      title: "Payments",
      href: "/staff/payments",
      icon: ReceiptText,
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <div className="size-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
            <Stamp className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm tracking-tight text-sidebar-foreground truncate">
              Visa Management
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              Staff Dashboard
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Sidebar Navigation Content */}
      <SidebarContent className="px-2 py-3">
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="cursor-pointer"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-sidebar-foreground truncate">
                {userName ?? userEmail ?? "Staff"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono uppercase px-1.5 py-0 shrink-0"
          >
            Staff
          </Badge>
        </div>

        <div className="mt-2 pt-2 border-t border-sidebar-border/60 flex items-center justify-between">
          <ThemeToggle className="size-7 text-muted-foreground hover:text-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
