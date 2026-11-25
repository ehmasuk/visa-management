"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  ReceiptText,
  PlusCircle,
} from "lucide-react";

export function StaffSidebar() {
  const pathname = usePathname();

  const mainNav = [
    {
      title: "Overview",
      href: "/staff",
      icon: LayoutDashboard,
      iconColor: "text-primary",
      exact: true,
    },
    {
      title: "Passports",
      href: "/staff/passports",
      icon: FileText,
      iconColor: "text-blue-500",
    },
    {
      title: "Passport Entry",
      href: "/staff/passport-entry",
      icon: PlusCircle,
      iconColor: "text-emerald-500",
    },
    {
      title: "Payments",
      href: "/staff/payments",
      icon: ReceiptText,
      iconColor: "text-amber-500",
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-sidebar-foreground truncate">
              Visa Management
            </span>
            <span className="text-[11px] text-muted-foreground truncate font-medium">
              Staff Desk
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Sidebar Navigation Content */}
      <SidebarContent className="px-2 py-3">
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2">
            Operations
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
                      className={`cursor-pointer font-medium ${
                        isActive
                          ? "bg-primary/10 text-primary font-bold shadow-2xs"
                          : ""
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 ${item.iconColor}`} />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
