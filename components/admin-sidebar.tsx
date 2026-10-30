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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Stamp,
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  MapPin,
  Truck,
  Layers,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  userEmail?: string | null;
  userName?: string | null;
}

export function AdminSidebar({
  userEmail,
  userName,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      iconColor: "text-primary",
    },
    {
      title: "Passports",
      href: "/admin/passports",
      icon: FileText,
      iconColor: "text-blue-500",
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
      iconColor: "text-purple-500",
    },
  ];

  const allowListsNav = [
    {
      title: "Agencies",
      href: "/admin/agencies",
      icon: Building2,
      iconColor: "text-blue-600 dark:text-blue-400",
      hint: "Gate",
    },
    {
      title: "Staff",
      href: "/admin/staff",
      icon: Users,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      hint: "Gate",
    },
  ];

  const registriesNav = [
    {
      title: "Branches",
      href: "/admin/branches",
      icon: MapPin,
      iconColor: "text-sky-500",
    },
    {
      title: "Collectors",
      href: "/admin/collectors",
      icon: Truck,
      iconColor: "text-amber-500",
    },
    {
      title: "Visa Types",
      href: "/admin/visa-types",
      icon: Layers,
      iconColor: "text-indigo-500",
    },
    {
      title: "Services",
      href: "/admin/services",
      icon: Sparkles,
      iconColor: "text-rose-500",
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
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
            <Stamp className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-sidebar-foreground truncate">
              Visa Management
            </span>
            <span className="text-[11px] text-muted-foreground truncate font-medium">
              Admin Portal
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
                const isActive = pathname === item.href;
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

        <SidebarSeparator className="my-2" />

        {/* Gmail Allow-Lists */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 flex items-center justify-between">
            <span>Identity & Access</span>
            <ShieldCheck className="size-3 text-primary opacity-60" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowListsNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                      {item.hint ? (
                        <span className="ml-auto text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 group-data-[collapsible=icon]:hidden">
                          {item.hint}
                        </span>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        {/* Master Registries */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2">
            Master Registries
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {registriesNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
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

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-sidebar-foreground truncate">
                {userName ?? "Administrator"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>
          <Badge
            className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary border-primary/20 shrink-0"
          >
            Admin
          </Badge>
        </div>

        <div className="mt-2 pt-2 border-t border-sidebar-border/60 flex items-center justify-between">
          <ThemeToggle className="size-7 text-muted-foreground hover:text-foreground" />
          <span className="text-[10px] text-muted-foreground font-mono">v1.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
