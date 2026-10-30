"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, CheckCircle2, Clock, FileText } from "lucide-react"
import { NativeSelect } from "@/components/ui/native-select"
import React from "react"

interface PassportItem {
  id: string
  passportNumber: string
  holderName: string
  agencyName: string
  collectorName: string
  deliveryCollectorName?: string | null
  fee: number
  status: "RECEIVED" | "PROCESSING" | "DELIVERED"
  receiptDate: string
  deliveryDate?: string | null
  paymentStatus?: "PAID" | "UNPAID" | "REQUESTED" | null
  paymentAmount?: number | null
}

interface AdminReportsClientProps {
  agencies: Array<{ name: string; gmail: string }>
  passports: PassportItem[]
}

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`

const STATUS_BADGE: Record<string, string> = {
  RECEIVED: "border-blue-500/40 text-blue-600 dark:text-blue-400",
  DELIVERED: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AdminReportsClient({
  agencies,
  passports,
}: AdminReportsClientProps) {
  const [selectedTimeWindow, setSelectedTimeWindow] = React.useState("all")
  const [selectedAgency, setSelectedAgency] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState("")
  const [selectedPayment, setSelectedPayment] = React.useState("")

  // Filter passports client-side by time window, agency, branch, status, payment.
  const filteredPassports = React.useMemo(() => {
    return passports.filter((p) => {
      if (selectedAgency && p.agencyName !== selectedAgency) return false
      if (selectedStatus && p.status !== selectedStatus) return false
      if (selectedPayment) {
        if (selectedPayment === "PAID" && p.paymentStatus !== "PAID")
          return false
        if (selectedPayment === "UNPAID" && p.paymentStatus !== "UNPAID")
          return false
        if (selectedPayment === "REQUESTED" && p.paymentStatus !== "REQUESTED")
          return false
      }
      if (selectedTimeWindow === "today") {
        const d = new Date(p.receiptDate)
        const today = new Date()
        return d.toDateString() === today.toDateString()
      }
      if (selectedTimeWindow === "7d") {
        const d = new Date(p.receiptDate)
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return d >= sevenDaysAgo && d <= now
      }
      if (selectedTimeWindow === "30d") {
        const d = new Date(p.receiptDate)
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return d >= thirtyDaysAgo && d <= now
      }
      return true
    })
  }, [
    passports,
    selectedTimeWindow,
    selectedAgency,
    selectedStatus,
    selectedPayment,
  ])

  const totalPassports = filteredPassports.length
  const totalPaid = filteredPassports.reduce(
    (sum, p) =>
      p.paymentStatus === "PAID" ? sum + (p.paymentAmount ?? 0) : sum,
    0
  )
  const unpaidPassportCount = filteredPassports.filter(
    (p) =>
      p.paymentStatus === "UNPAID" ||
      p.paymentStatus === "REQUESTED" ||
      p.paymentStatus === null
  ).length
  const totalUnpaid = filteredPassports.reduce(
    (sum, p) =>
      p.paymentStatus === "UNPAID" || p.paymentStatus === "REQUESTED"
        ? sum + p.fee
        : sum,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Admin Report
      </h1>
      {/* Filter controls
 bar */}
      <div className="flex flex-wrap items-end gap-3">
        {/* timeline */}

        <Button
          onClick={() => setSelectedTimeWindow("all")}
          variant={selectedTimeWindow === "all" ? "default" : "outline"}
          size="sm"
        >
          All time
        </Button>
        <Button
          onClick={() => setSelectedTimeWindow("today")}
          variant={selectedTimeWindow === "today" ? "default" : "outline"}
          size="sm"
        >
          Today
        </Button>
        <Button
          onClick={() => setSelectedTimeWindow("7d")}
          variant={selectedTimeWindow === "7d" ? "default" : "outline"}
          size="sm"
        >
          Last 7 days
        </Button>
        <Button
          onClick={() => setSelectedTimeWindow("30d")}
          variant={selectedTimeWindow === "30d" ? "default" : "outline"}
          size="sm"
        >
          Last 30 days
        </Button>

        <NativeSelect
          value={selectedAgency}
          onChange={(e) => setSelectedAgency(e.target.value)}
          className="h-8 truncate text-xs font-medium"
        >
          <option value="">All Agencies</option>
          {agencies.map((a) => (
            <option key={a.gmail} value={a.name}>
              {a.name}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-8 truncate text-xs font-medium"
        >
          <option value="">All Statuses</option>
          <option value="RECEIVED">Received</option>
          <option value="DELIVERED">Delivered</option>
        </NativeSelect>

        <NativeSelect
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
          className="h-8 truncate text-xs font-medium"
        >
          <option value="">All Payment Statuses</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
          <option value="REQUESTED">Requested</option>
        </NativeSelect>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Total Passports */}
        <div className="rounded-xl border border-border/80 bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Total Passports
            </span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            {totalPassports}
          </p>
        </div>

        {/* Total Paid */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
              Total Paid
            </span>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {taka(totalPaid)}
          </p>
        </div>

        {/* Unpaid Count */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 ring-1 ring-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-400">
              Unpaid Count
            </span>
            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-700 dark:text-amber-300">
            {unpaidPassportCount}
          </p>
        </div>

        {/* Total Unpaid Amount */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 ring-1 ring-destructive/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-destructive uppercase dark:text-destructive/400">
              Total Unpaid Amount
            </span>
            <ArrowUpRight className="size-4 text-destructive dark:text-destructive/400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-destructive dark:text-destructive/400">
            {taka(totalUnpaid)}
          </p>
        </div>
      </div>

      {/* Filtered passport listing */}
      <div className="rounded-xl border border-border/80 bg-card p-5 ring-1 ring-foreground/10">
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
              <FileText className="size-4 text-primary" />
              <span>Filtered Passports</span>
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Passport list based on current filter
            </p>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {filteredPassports.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <th className="px-3 py-2.5">Passport No.</th>
                <th className="px-3 py-2.5">Holder</th>
                <th className="px-3 py-2.5">Agency</th>
                <th className="px-3 py-2.5">Collector</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5 text-right">Fee</th>
                <th className="px-3 py-2.5 text-center">Payment</th>
                <th className="px-3 py-2.5 text-right">Receipt Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredPassports.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-8 text-center text-xs text-muted-foreground"
                    colSpan={8}
                  >
                    No passports found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredPassports.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5 font-mono font-semibold text-foreground">
                      {p.passportNumber}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {p.holderName}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {p.agencyName}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {p.collectorName}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={`px-1.5 py-0 font-mono text-[10px] uppercase ${STATUS_BADGE[p.status]}`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground">
                      {taka(p.fee)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {p.paymentStatus === "PAID" ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          Paid
                        </span>
                      ) : p.paymentStatus === "REQUESTED" ? (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          Requested
                        </span>
                      ) : p.paymentStatus === "UNPAID" ? (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          Unpaid
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Not requested
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                      {formatDate(p.receiptDate)} {formatTime(p.receiptDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredPassports.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border/80 bg-muted/20 font-bold text-foreground">
                  <td className="px-3 py-2.5" colSpan={3}>
                    Total
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono" colSpan={2}>
                    {filteredPassports.length}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground">
                    {taka(filteredPassports.reduce((s, p) => s + p.fee, 0))}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono" colSpan={2}>
                    —
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
