"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Users,
  Building2,
  Truck,
  FileText,
  BadgePercent,
  BarChart3,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Layers,
  Banknote,
  Search,
  ShieldCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AdminDashboardData {
  counts: {
    branches: number;
    agencies: number;
    collectors: number;
    staff: number;
    visaTypes: number;
    services: number;
    totalPassports: number;
    receivedPassports: number;
    deliveredPassports: number;
    paidAmount: number;
    unpaidAmount: number;
  };
  recentPassports: Array<{
    id: string;
    passportNumber: string;
    holderName: string;
    agencyName: string;
    status: "RECEIVED" | "DELIVERED";
    fee: number;
    lastEditedByName: string | null;
    updatedAt: string;
  }>;
  adminEmail: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut" as const,
    },
  },
};

export function AdminDashboardClient({ data }: { data: AdminDashboardData }) {
  const { counts, recentPassports, adminEmail } = data;

  const registryGroups = [
    {
      groupTitle: "Gmail Allow-Lists",
      groupDescription:
        "Only Google accounts allow-listed here can sign in. Agency emails route to /agency, staff to /staff.",
      items: [
        {
          title: "Agencies",
          href: "/admin/agencies",
          count: counts.agencies,
          unit: "allow-listed agencies",
          description:
            "Agency Gmail allow-list. Gives registered client agencies self-service access to view their passports.",
          icon: Building2,
          badge: "Sign-in Gate",
        },
        {
          title: "Staff",
          href: "/admin/staff",
          count: counts.staff,
          unit: "authorized staff",
          description:
            "Staff Gmail allow-list. Authorized employees who enter passports, update statuses, and handle payments.",
          icon: Users,
          badge: "Sign-in Gate",
        },
      ],
    },
    {
      groupTitle: "Master Registries",
      groupDescription:
        "Registries selectable by staff when entering passports and marking delivery.",
      items: [
        {
          title: "Branches",
          href: "/admin/branches",
          count: counts.branches,
          unit: "branches",
          description:
            "Branch office records of the business.",
          icon: MapPin,
        },
        {
          title: "Collectors",
          href: "/admin/collectors",
          count: counts.collectors,
          unit: "collectors",
          description:
            "Couriers recorded as intake collector at entry, or assigned as delivery collector at delivery.",
          icon: Truck,
        },
        {
          title: "Visa Types",
          href: "/admin/visa-types",
          count: counts.visaTypes,
          unit: "visa types",
          description:
            "Visa types offered by the business; staff select from this registry when entering a passport.",
          icon: Layers,
        },
        {
          title: "Services",
          href: "/admin/services",
          count: counts.services,
          unit: "services",
          description:
            "Processing packages and services selectable at passport entry.",
          icon: Sparkles,
        },
      ],
    },
    {
      groupTitle: "Reports & Passports",
      groupDescription:
        "Passport counts, money collected reports, and complete passport records.",
      items: [
        {
          title: "Reports",
          href: "/admin/reports",
          count: null,
          unit: "Metrics & Reports",
          description:
            "Passport count reports and money collected reports (paid vs unpaid), grouped by day, month, or agency.",
          icon: BarChart3,
          badge: "Financial",
        },
        {
          title: "Passports",
          href: "/admin/passports",
          count: counts.totalPassports,
          unit: "total passports",
          description:
            "View, edit, and update status for every passport across all agencies; last editor is stamped on each change.",
          icon: BookOpen,
        },
      ],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Admin Context Banner */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-border/80 bg-card/60 p-5 sm:p-6 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-[10px] uppercase tracking-wider"
            >
              Primary Admin
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-[70ch]">
            Manage the organization registry — branches, agency and staff Gmail
            allow-lists, collectors, visa types, services, and reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/passports"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted cursor-pointer shadow-2xs"
          >
            <Search className="size-3.5 text-muted-foreground" />
            <span>View Passports</span>
          </Link>
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 cursor-pointer shadow-2xs"
          >
            <BarChart3 className="size-3.5" />
            <span>Open Reports</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Real-Time Passports & Money Overview */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Passport Counts & Money Overview
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            Live Records
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Total Passports */}
          <Link
            href="/admin/passports"
            className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-foreground/30 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Passports
              </span>
              <FileText className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight font-mono text-foreground">
              {counts.totalPassports}
            </p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              All agencies
            </span>
          </Link>

          {/* Received Status */}
          <div className="rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Received
              </span>
              <span className="size-2 rounded-full bg-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight font-mono text-foreground">
              {counts.receivedPassports}
            </p>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 block">
              At office
            </span>
          </div>

          {/* Delivered Status */}
          <div className="rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Delivered
              </span>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight font-mono text-foreground">
              {counts.deliveredPassports}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              Delivered to agency
            </span>
          </div>

          {/* Money Collected */}
          <Link
            href="/admin/reports"
            className="col-span-2 lg:col-span-1 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-foreground/30 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Money Collected
              </span>
              <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight font-mono text-foreground">
              ৳ {counts.paidAmount.toLocaleString()}
            </p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              ৳ {counts.unpaidAmount.toLocaleString()} unpaid
            </span>
          </Link>
        </div>
      </motion.div>

      {/* Registry Navigation Hub */}
      <div className="space-y-6">
        {registryGroups.map((group) => (
          <motion.div key={group.groupTitle} variants={itemVariants}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {group.groupTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {group.groupDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <Link
                      href={item.href}
                      className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-foreground/30 hover:shadow-xs h-full"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <Icon className="size-4" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.badge ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-mono px-1.5 py-0.5"
                              >
                                {item.badge}
                              </Badge>
                            ) : null}
                            <ArrowUpRight className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-foreground">
                          {item.count !== null ? (
                            <>
                              {item.count}{" "}
                              <span className="font-normal font-sans text-muted-foreground text-[11px]">
                                {item.unit}
                              </span>
                            </>
                          ) : (
                            <span className="font-normal font-sans text-muted-foreground text-[11px]">
                              {item.unit}
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-medium text-primary group-hover:underline inline-flex items-center gap-1">
                          Manage
                          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Movements & Access Model */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Recent Passports List */}
        <div className="lg:col-span-7 rounded-xl border border-border/80 bg-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="font-semibold text-sm text-foreground tracking-tight">
                Recent Passports
              </h3>
              <p className="text-xs text-muted-foreground">
                Latest passport entries and updates across client agencies.
              </p>
            </div>
            <Link
              href="/admin/passports"
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              View all →
            </Link>
          </div>

          {recentPassports.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No passports recorded yet. Entries created by staff will appear
              here.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentPassports.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {p.passportNumber}
                      </span>
                      <span
                        className={`inline-block size-1.5 rounded-full ${
                          p.status === "DELIVERED"
                            ? "bg-emerald-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="text-muted-foreground truncate">
                        {p.holderName}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Agency:{" "}
                      <span className="text-foreground/80 font-medium">
                        {p.agencyName}
                      </span>{" "}
                      • Last editor: {p.lastEditedByName ?? "Staff"}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-medium text-foreground block">
                      ৳ {p.fee.toLocaleString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-mono px-1.5 py-0 mt-0.5 ${
                        p.status === "DELIVERED"
                          ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                          : "border-blue-500/40 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Access Model Card */}
        <div className="lg:col-span-5 rounded-xl border border-border/80 bg-muted/30 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="size-4 text-foreground" />
              <h3 className="font-semibold text-sm text-foreground tracking-tight">
                Access Model & System Rules
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rules defined in the specification for authentication, roles, and
              passports:
            </p>

            <ul className="mt-3 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-3.5 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Single Admin Account:</strong> Only one active ADMIN
                  account exists in the system (bootstrap admin:{" "}
                  <code>{adminEmail}</code>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="size-3.5 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Gmail Allow-List:</strong> Only emails allow-listed by
                  the admin can sign in with Google. Agency emails go to{" "}
                  <code>/agency</code>, staff emails to <code>/staff</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="size-3.5 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Intake & Delivery Collectors:</strong> Intake
                  collector (who brought the passport) is captured at entry.
                  Delivery collector is assigned when status changes to
                  delivered.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="size-3.5 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Automatic Timestamps:</strong> Receipt date is set
                  automatically on creation; delivery date is set automatically
                  on delivery. Neither is entered manually.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Admin Status: Active</span>
            <span className="font-mono">Google OAuth 2.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
