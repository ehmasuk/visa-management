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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  MapPin,
  Truck,
  Layers,
  Sparkles,
  BarChart3,
} from "lucide-react";

export function AdminSidebar() {
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
      title: "Staff",
      href: "/admin/staff",
      icon: Users,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const registriesNav = [
    {
      title: "Agencies",
      href: "/admin/agencies",
      icon: Building2,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
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

        {/* Staff sign-in allow-list */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2">
            Staff Access
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

    </Sidebar>
  );
}
