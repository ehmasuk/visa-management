"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Users,
  Building2,
  Truck,
  FileText,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Sparkles,
  Layers,
  ArrowUpRight,
  Receipt,
  PlusCircle,
  Eye,
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

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AdminDashboardClient({ data }: { data: AdminDashboardData }) {
  const { counts, recentPassports, adminEmail } = data;

  const totalMoney = counts.paidAmount + counts.unpaidAmount;
  const collectionRate =
    totalMoney > 0 ? Math.round((counts.paidAmount / totalMoney) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Welcome & Actions Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Operations Center
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-[11px] font-semibold">
              Root Authority
            </Badge>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{adminEmail}</span>. Real-time governance over registries, security allow-lists, and financial totals.
          </p>
        </div>

        {/* Fast Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/passports"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-muted shadow-2xs"
          >
            <FileText className="size-4 text-primary" />
            <span>All Passports</span>
          </Link>
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
          >
            <BarChart3 className="size-4" />
            <span>Financial Reports</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Passports */}
        <Link
          href="/admin/passports"
          className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Passports
            </span>
            <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <FileText className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground tracking-tight font-mono">
              {counts.totalPassports}
            </span>
            <span className="text-xs text-muted-foreground">registered</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span>View directory</span>
            <ArrowUpRight className="size-3.5" />
          </div>
        </Link>

        {/* Counter Received (In Process) */}
        <Link
          href="/admin/passports"
          className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-sky-500/40 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In Processing
            </span>
            <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
              <Clock className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground tracking-tight font-mono">
              {counts.receivedPassports}
            </span>
            <span className="text-xs text-muted-foreground">received at desk</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-medium">
            <span>Active at counter</span>
            <ArrowUpRight className="size-3.5" />
          </div>
        </Link>

        {/* Delivered Passports */}
        <Link
          href="/admin/passports"
          className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Delivered
            </span>
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground tracking-tight font-mono">
              {counts.deliveredPassports}
            </span>
            <span className="text-xs text-muted-foreground">handed to agency</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Completed custody</span>
            <ArrowUpRight className="size-3.5" />
          </div>
        </Link>

        {/* Financial Settlement */}
        <Link
          href="/admin/reports"
          className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fees Settled
            </span>
            <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Receipt className="size-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {taka(counts.paidAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Unpaid: {taka(counts.unpaidAmount)}</span>
            <span className="font-semibold text-foreground">{collectionRate}% Paid</span>
          </div>
        </Link>
      </div>

      {/* Two Hubs: Allow-Lists & Master Registries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 Cols): Security Allow-Lists */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Security Allow-Lists
              </h2>
              <p className="text-xs text-muted-foreground">
                Google accounts authorized to authenticate into the system.
              </p>
            </div>
            <ShieldCheck className="size-4 text-primary" />
          </div>

          <div className="space-y-3">
            {/* Agencies Card */}
            <Link
              href="/admin/agencies"
              className="group flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Client Agencies
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Self-service agency portal access
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {counts.agencies}
                </span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            {/* Staff Card */}
            <Link
              href="/admin/staff"
              className="group flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    Staff Personnel
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Passport intake & status operators
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {counts.staff}
                </span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column (7 Cols): Operations Master Registries */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Master Registries
              </h2>
              <p className="text-xs text-muted-foreground">
                Configured data options selectable during passport intake & delivery.
              </p>
            </div>
            <Layers className="size-4 text-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Branches */}
            <Link
              href="/admin/branches"
              className="group p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <MapPin className="size-4.5" />
                </div>
                <span className="font-mono text-sm font-bold text-foreground">
                  {counts.branches}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Branches
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Office physical locations
              </p>
            </Link>

            {/* Collectors */}
            <Link
              href="/admin/collectors"
              className="group p-4 rounded-2xl border border-border/80 bg-card hover:border-amber-500/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <Truck className="size-4.5" />
                </div>
                <span className="font-mono text-sm font-bold text-foreground">
                  {counts.collectors}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors">
                Collectors
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Intake & delivery couriers
              </p>
            </Link>

            {/* Visa Types */}
            <Link
              href="/admin/visa-types"
              className="group p-4 rounded-2xl border border-border/80 bg-card hover:border-purple-500/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                  <Layers className="size-4.5" />
                </div>
                <span className="font-mono text-sm font-bold text-foreground">
                  {counts.visaTypes}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-purple-600 transition-colors">
                Visa Types
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Work, tourist, business visas
              </p>
            </Link>

            {/* Services */}
            <Link
              href="/admin/services"
              className="group p-4 rounded-2xl border border-border/80 bg-card hover:border-rose-500/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="size-4.5" />
                </div>
                <span className="font-mono text-sm font-bold text-foreground">
                  {counts.services}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-rose-600 transition-colors">
                Service Tiers
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Normal, urgent processing
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Custody Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Recent Passport Activity
            </h2>
            <p className="text-xs text-muted-foreground">
              Latest recorded mutations with last-editor audit trail.
            </p>
          </div>
          <Link
            href="/admin/passports"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all passports</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentPassports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            No passports recorded in the system yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Passport No.</th>
                    <th className="px-4 py-3">Holder Name</th>
                    <th className="px-4 py-3">Agency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Fee</th>
                    <th className="px-4 py-3">Audited By</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentPassports.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {p.passportNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {p.holderName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.agencyName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            p.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              p.status === "DELIVERED"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                          />
                          {p.status === "DELIVERED" ? "Delivered" : "Received"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">
                        {taka(p.fee)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        <span>{p.lastEditedByName ?? "System"}</span>
                        <span className="block text-[10px] text-muted-foreground/70">
                          {formatDate(p.updatedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/passports/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted font-medium text-foreground transition-colors"
                        >
                          <Eye className="size-3 text-muted-foreground" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
