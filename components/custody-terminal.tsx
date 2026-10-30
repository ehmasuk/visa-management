"use client";

import * as React from "react";
import {
  Truck,
  CheckCircle2,
  FileCheck2,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PassportStatus = "RECEIVED" | "DELIVERED";

interface MockPassport {
  id: string;
  passportNumber: string;
  holderName: string;
  agencyName: string;
  visaType: string;
  service: string;
  fee: number;
  intakeCollector: string;
  receivedAt: string;
  deliveryCollector?: string;
  deliveredAt?: string;
  paymentStatus: "PENDING" | "APPROVED" | "UNPAID";
  lastEditor: string;
}

const PRESETS: Record<PassportStatus, MockPassport> = {
  RECEIVED: {
    id: "rec_01",
    passportNumber: "A08492041",
    holderName: "Mohammad Al-Amin",
    agencyName: "Green Crest Travels",
    visaType: "Saudi Arabia (Work Visa)",
    service: "Normal Processing",
    fee: 8500,
    intakeCollector: "Zahid Collector",
    receivedAt: "Today, 09:45 AM",
    paymentStatus: "UNPAID",
    lastEditor: "Tanvir (Staff)",
  },
  DELIVERED: {
    id: "rec_03",
    passportNumber: "EE-7182930",
    holderName: "Tanvir Ahmed Chowdhury",
    agencyName: "Al-Haramain Overseas",
    visaType: "Qatar (Commercial Resident)",
    service: "Urgent Stamping",
    fee: 15500,
    intakeCollector: "Zahid Collector",
    receivedAt: "Oct 26, 11:30 AM",
    deliveryCollector: "Kamal (Delivery Man)",
    deliveredAt: "Today, 11:20 AM",
    paymentStatus: "APPROVED",
    lastEditor: "Admin Console",
  },
};

export function CustodyTerminal() {
  const [selectedStatus, setSelectedStatus] =
    React.useState<PassportStatus>("RECEIVED");
  const [isCopied, setIsCopied] = React.useState(false);

  const activeRecord = PRESETS[selectedStatus];

  const handleCopySerial = () => {
    navigator.clipboard?.writeText(activeRecord.passportNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Decorative ambient color glow */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-primary/15 via-blue-500/10 to-emerald-500/15 blur-2xl -z-10 opacity-70 pointer-events-none" />

      {/* Main Terminal Dossier Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl p-6 sm:p-7 text-card-foreground transition-all duration-300">
        {/* Dossier Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold shadow-xs">
              <FileCheck2 className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-foreground">
                  Custody Dossier
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Verified
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                REGISTRY ID #{activeRecord.id.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Interactive Lifecycle Switcher Tabs */}
          <div className="flex items-center rounded-lg bg-muted/60 p-1 border border-border/60">
            {(["RECEIVED", "DELIVERED"] as PassportStatus[]).map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status === "RECEIVED" ? "1. Received" : "2. Delivered"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Passport Identity Ribbon */}
        <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Passport Holder
              </span>
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {activeRecord.holderName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building className="size-3 text-muted-foreground" />
                <span>Agency:</span>
                <span className="font-semibold text-foreground">
                  {activeRecord.agencyName}
                </span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Document Number
              </span>
              <div className="flex items-center sm:justify-end gap-1.5 mt-1">
                <button
                  onClick={handleCopySerial}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted font-mono text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs"
                  title="Click to copy passport serial"
                >
                  <span>{activeRecord.passportNumber}</span>
                  {isCopied ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Status Progression */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Chain of Custody Flow
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Auto-Stamped Dates
            </span>
          </div>

          <div className="space-y-3">
            {/* Step 1: Intake */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-500/25 bg-blue-500/5 text-foreground transition-all">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    1. Received at Counter
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {activeRecord.receivedAt}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Brought by intake courier{" "}
                  <span className="font-semibold text-foreground">
                    {activeRecord.intakeCollector}
                  </span>
                  . Visa: {activeRecord.visaType}.
                </p>
              </div>
            </div>

            {/* Step 2: Delivery */}
            <div
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                selectedStatus === "DELIVERED"
                  ? "border-emerald-500/35 bg-emerald-500/5 text-foreground"
                  : "border-border/50 bg-muted/20 text-muted-foreground opacity-75"
              }`}
            >
              <div
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                  selectedStatus === "DELIVERED"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedStatus === "DELIVERED" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Truck className="size-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold ${
                      selectedStatus === "DELIVERED"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-muted-foreground"
                    }`}
                  >
                    2. Delivered to Agency
                  </span>
                  {selectedStatus === "DELIVERED" ? (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      {activeRecord.deliveredAt}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      In Embassy Processing
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedStatus === "DELIVERED" ? (
                    <>
                      Assigned delivery collector:{" "}
                      <span className="font-semibold text-foreground">
                        {activeRecord.deliveryCollector}
                      </span>
                      . Delivery timestamp recorded automatically.
                    </>
                  ) : (
                    "Delivery collector assigned upon transition to Delivered status."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta & Ledger Status */}
        <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                Service Fee
              </span>
              <span className="font-bold text-foreground font-mono text-sm">
                ৳ {activeRecord.fee.toLocaleString()}
              </span>
            </div>
            <div className="h-6 w-px bg-border/80" />
            <div>
              <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                Payment Status
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold text-xs ${
                  activeRecord.paymentStatus === "APPROVED"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : activeRecord.paymentStatus === "PENDING"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    activeRecord.paymentStatus === "APPROVED"
                      ? "bg-emerald-500"
                      : activeRecord.paymentStatus === "PENDING"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
                {activeRecord.paymentStatus === "APPROVED" && "Settled (Approved)"}
                {activeRecord.paymentStatus === "PENDING" && "Payment Requested"}
                {activeRecord.paymentStatus === "UNPAID" && "Unpaid Balance"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
              Last Audited By
            </span>
            <span className="text-foreground font-semibold">
              {activeRecord.lastEditor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
