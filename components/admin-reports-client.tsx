"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";
import React from "react";

interface PassportItem {
  id: string;
  passportNumber: string;
  holderName: string;
  agencyName: string;
  collectorName: string;
  deliveryCollectorName?: string | null;
  fee: number;
  status: "RECEIVED" | "DELIVERED";
  receiptDate: string;
  deliveryDate?: string | null;
  paymentStatus?: "PAID" | "UNPAID" | "REQUESTED" | null;
  paymentAmount?: number | null;
}

interface AdminReportsClientProps {
  agencies: Array<{ name: string; gmail: string }>;
  passports: PassportItem[];
}

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminReportsClient({
  agencies,
  passports,
}: AdminReportsClientProps) {
  const [selectedTimeWindow, setSelectedTimeWindow] = React.useState("all");
  const [selectedAgency, setSelectedAgency] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("");
  const [selectedPayment, setSelectedPayment] = React.useState("");

  // Filter passports client-side by time window, agency, branch, status, payment.
  const filteredPassports = React.useMemo(() => {
    return passports.filter((p) => {
      if (selectedAgency && p.agencyName !== selectedAgency) return false;
      if (selectedStatus && p.status !== selectedStatus) return false;
      if (selectedPayment) {
        if (selectedPayment === "PAID" && p.paymentStatus !== "PAID")
          return false;
        if (selectedPayment === "UNPAID" && p.paymentStatus !== "UNPAID")
          return false;
        if (selectedPayment === "REQUESTED" && p.paymentStatus !== "REQUESTED")
          return false;
      }
      if (selectedTimeWindow === "today") {
        const d = new Date(p.receiptDate);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }
      if (selectedTimeWindow === "7d") {
        const d = new Date(p.receiptDate);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= sevenDaysAgo && d <= now;
      }
      if (selectedTimeWindow === "30d") {
        const d = new Date(p.receiptDate);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= thirtyDaysAgo && d <= now;
      }
      return true;
    });
  }, [
    passports,
    selectedTimeWindow,
    selectedAgency,
    selectedStatus,
    selectedPayment,
  ]);

  const totalPassports = filteredPassports.length;
  const totalPaid = filteredPassports.reduce(
    (sum, p) =>
      p.paymentStatus === "PAID" ? sum + (p.paymentAmount ?? 0) : sum,
    0
  );
  const unpaidPassportCount = filteredPassports.filter(
    (p) =>
      p.paymentStatus === "UNPAID" ||
      p.paymentStatus === "REQUESTED" ||
      p.paymentStatus === null
  ).length;
  const totalUnpaid = filteredPassports.reduce(
    (sum, p) =>
      p.paymentStatus === "UNPAID" || p.paymentStatus === "REQUESTED"
        ? sum + p.fee
        : sum,
    0
  );
  const totalFees = filteredPassports.reduce((sum, p) => sum + p.fee, 0);

  const resetFilters = () => {
    setSelectedTimeWindow("all");
    setSelectedAgency("");
    setSelectedStatus("");
    setSelectedPayment("");
  };

  const hasActiveFilters =
    selectedTimeWindow !== "all" ||
    selectedAgency !== "" ||
    selectedStatus !== "" ||
    selectedPayment !== "";

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Financial & Volume Reports
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Audited passport counts and settlement totals (Paid vs. Unpaid).
          </p>
        </div>

        {hasActiveFilters && (
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto text-xs gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeline Pills */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/60">
            {(
              [
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTimeWindow(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedTimeWindow === t.id
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/80 hidden sm:block" />

          {/* Agency Filter */}
          <div className="w-full sm:w-auto">
            <NativeSelect
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="h-9 w-full sm:w-44 text-xs font-medium rounded-xl"
            >
              <option value="">All Agencies</option>
              {agencies.map((a) => (
                <option key={a.gmail} value={a.name}>
                  {a.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto">
            <NativeSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 w-full sm:w-36 text-xs font-medium rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="DELIVERED">Delivered</option>
            </NativeSelect>
          </div>

          {/* Payment Status Filter */}
          <div className="w-full sm:w-auto">
            <NativeSelect
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="h-9 w-full sm:w-44 text-xs font-medium rounded-xl"
            >
              <option value="">All Settlements</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="REQUESTED">Awaiting Approval</option>
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Passports */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Passports
            </span>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-foreground">
            {totalPassports}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Total fee: {taka(totalFees)}
          </p>
        </div>

        {/* Total Paid */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Paid Volume
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {taka(totalPaid)}
          </p>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">
            Settlement approved
          </p>
        </div>

        {/* Unpaid Count */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Unpaid Records
            </span>
            <div className="size-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-amber-700 dark:text-amber-300">
            {unpaidPassportCount}
          </p>
          <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">
            Awaiting full payment
          </p>
        </div>

        {/* Total Unpaid Amount */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Unpaid Balance
            </span>
            <div className="size-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {taka(totalUnpaid)}
          </p>
          <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80 font-medium">
            Outstanding fees
          </p>
        </div>
      </div>

      {/* Filtered Passport Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Filtered Records
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground font-semibold">
            {filteredPassports.length} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Passport No.</th>
                <th className="px-4 py-3">Holder</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Intake Collector</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-center">Settlement</th>
                <th className="px-4 py-3 text-right">Receipt Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPassports.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-xs text-muted-foreground"
                    colSpan={8}
                  >
                    No passports found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPassports.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {p.passportNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {p.holderName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.agencyName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.collectorName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                      {taka(p.fee)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.paymentStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          <span>Paid</span>
                        </span>
                      ) : p.paymentStatus === "REQUESTED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="size-3" />
                          <span>Awaiting</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <span>Unpaid</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {formatDate(p.receiptDate)}{" "}
                      <span className="text-[10px] opacity-75">
                        {formatTime(p.receiptDate)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredPassports.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border/80 bg-muted/40 font-bold text-foreground">
                  <td className="px-4 py-3" colSpan={3}>
                    Filtered Total ({filteredPassports.length} items)
                  </td>
                  <td className="px-4 py-3 text-center font-mono" colSpan={2}>
                    —
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground text-sm font-extrabold">
                    {taka(totalFees)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs" colSpan={2}>
                    Paid: {taka(totalPaid)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
