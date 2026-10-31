"use client";

import * as React from "react";
import {
  Truck,
  Copy,
  Check,
  FileCheck2,
  FileText,
  FileSearch,
  Send,
  Building,
  type LucideIcon,
} from "lucide-react";
import {
  STAGES,
  statusLabel,
  type PassportStage,
} from "@/lib/passport-format";

interface DemoPassport {
  id: string;
  passportNumber: string;
  holderName: string;
  agencyName: string;
  visaType: string;
  fee: number;
  intakeCollector: string;
  receivedAt: string;
  underReviewAt?: string;
  submittedAt?: string;
  deliveryCollector?: string;
  deliveredAt?: string;
  paymentStatus: "PENDING" | "APPROVED" | "UNPAID";
  lastEditor: string;
}

/** One demo passport whose custody timeline can be walked stage by stage. */
const DEMO_PASSPORT: DemoPassport = {
  id: "rec_01",
  passportNumber: "A08492041",
  holderName: "Mohammad Al-Amin",
  agencyName: "Green Crest Travels",
  visaType: "Saudi Arabia (Work Visa)",
  fee: 8500,
  intakeCollector: "Zahid Collector",
  receivedAt: "Oct 26, 11:30 AM",
  underReviewAt: "Oct 27, 10:05 AM",
  submittedAt: "Oct 28, 09:40 AM",
  deliveryCollector: "Kamal (Delivery Man)",
  deliveredAt: "Today, 11:20 AM",
  paymentStatus: "APPROVED",
  lastEditor: "Tanvir (Staff)",
};

/** The milestone stamp recorded for a demo stage, or undefined if unreached. */
function stageStamp(record: DemoPassport, stage: PassportStage): string | undefined {
  switch (stage) {
    case "RECEIVED":
      return record.receivedAt;
    case "UNDER_REVIEW":
      return record.underReviewAt;
    case "SUBMITTED":
      return record.submittedAt;
    case "DELIVERED":
      return record.deliveredAt;
  }
}

/** Per-stage accent classes and icon for the custody flow rows. */
const STAGE_ACCENT: Record<
  PassportStage,
  {
    icon: LucideIcon;
    row: string;
    circle: string;
    title: string;
    stamp: string;
  }
> = {
  RECEIVED: {
    icon: FileText,
    row: "border-blue-500/25 bg-blue-500/5",
    circle: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    title: "text-blue-700 dark:text-blue-300",
    stamp: "text-muted-foreground",
  },
  UNDER_REVIEW: {
    icon: FileSearch,
    row: "border-amber-500/25 bg-amber-500/5",
    circle: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    title: "text-amber-700 dark:text-amber-300",
    stamp: "text-muted-foreground",
  },
  SUBMITTED: {
    icon: Send,
    row: "border-purple-500/25 bg-purple-500/5",
    circle: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    title: "text-purple-700 dark:text-purple-300",
    stamp: "text-muted-foreground",
  },
  DELIVERED: {
    icon: Truck,
    row: "border-emerald-500/35 bg-emerald-500/5",
    circle: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
    stamp: "text-emerald-600 dark:text-emerald-400",
  },
};

export function CustodyTerminal() {
  const [selectedStatus, setSelectedStatus] =
    React.useState<PassportStage>("RECEIVED");
  const [isCopied, setIsCopied] = React.useState(false);

  const activeIdx = STAGES.indexOf(selectedStatus);
  const record = DEMO_PASSPORT;

  const handleCopySerial = () => {
    navigator.clipboard?.writeText(record.passportNumber);
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
                REGISTRY ID #{record.id.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Interactive Lifecycle Switcher Tabs — one per pipeline stage */}
          <div className="flex items-center rounded-lg bg-muted/60 p-1 border border-border/60">
            {STAGES.map((stage, index) => {
              const isActive = selectedStatus === stage;
              return (
                <button
                  key={stage}
                  onClick={() => setSelectedStatus(stage)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {index + 1}. {statusLabel(stage)}
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
                {record.holderName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building className="size-3 text-muted-foreground" />
                <span>Agency:</span>
                <span className="font-semibold text-foreground">
                  {record.agencyName}
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
                  <span>{record.passportNumber}</span>
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

        {/* Real-Time Status Progression — the four pipeline stages in order */}
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
            {STAGES.map((stage, index) => {
              const reached = index <= activeIdx;
              const stamp = stageStamp(record, stage);
              const accent = STAGE_ACCENT[stage];
              const StepIcon = accent.icon;
              return (
                <div
                  key={stage}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    reached
                      ? `${accent.row} text-foreground`
                      : "border-border/50 bg-muted/20 text-muted-foreground opacity-75"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                      reached ? accent.circle : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <StepIcon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold ${
                          reached ? accent.title : "text-muted-foreground"
                        }`}
                      >
                        {index + 1}. {statusLabel(stage)}
                      </span>
                      {reached ? (
                        <span
                          className={`text-[11px] font-mono ${accent.stamp || "text-muted-foreground"}`}
                        >
                          {stamp}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {reached && stage === "RECEIVED" && (
                        <>
                          Brought by intake courier{" "}
                          <span className="font-semibold text-foreground">
                            {record.intakeCollector}
                          </span>
                          . Visa: {record.visaType}.
                        </>
                      )}
                      {reached && stage === "UNDER_REVIEW" && (
                        <>
                          Documents under examination by staff operators.
                        </>
                      )}
                      {reached && stage === "SUBMITTED" && (
                        <>
                          Filed with the embassy for visa stamping. Submission
                          timestamp recorded automatically.
                        </>
                      )}
                      {reached && stage === "DELIVERED" && (
                        <>
                          Assigned delivery collector:{" "}
                          <span className="font-semibold text-foreground">
                            {record.deliveryCollector}
                          </span>
                          . Delivery timestamp recorded automatically.
                        </>
                      )}
                      {!reached &&
                        (stage === "DELIVERED"
                          ? "Delivery collector assigned upon transition to Delivered status."
                          : `Awaiting the ${statusLabel(stage).toLowerCase()} stage.`)}
                    </p>
                  </div>
                </div>
              );
            })}
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
                ৳ {record.fee.toLocaleString()}
              </span>
            </div>
            <div className="h-6 w-px bg-border/80" />
            <div>
              <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                Payment Status
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold text-xs ${
                  record.paymentStatus === "APPROVED"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : record.paymentStatus === "PENDING"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    record.paymentStatus === "APPROVED"
                      ? "bg-emerald-500"
                      : record.paymentStatus === "PENDING"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
                {record.paymentStatus === "APPROVED" && "Settled (Approved)"}
                {record.paymentStatus === "PENDING" && "Payment Requested"}
                {record.paymentStatus === "UNPAID" && "Unpaid Balance"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
              Last Audited By
            </span>
            <span className="text-foreground font-semibold">
              {record.lastEditor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
