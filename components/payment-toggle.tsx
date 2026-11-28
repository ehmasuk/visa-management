"use client";

import { useFormStatus } from "react-dom";
import { Check, RotateCcw } from "lucide-react";
import { togglePaymentStatus } from "@/app/actions/payment";
import { cn } from "@/lib/utils";

/** Inline submit with a pending guard so a double click cannot double-toggle. */
function ToggleButton({ paid, compact }: { paid: boolean; compact: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      title={paid ? "Mark this passport's payment as unpaid" : "Mark this passport's payment as paid"}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-60 disabled:pointer-events-none",
        compact ? "px-2 py-1" : "px-3 py-1.5",
        paid
          ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
          : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
      )}
    >
      {pending ? (
        <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : paid ? (
        <RotateCcw className="size-3.5" />
      ) : (
        <Check className="size-3.5" />
      )}
      <span>{paid ? "Mark Unpaid" : "Mark Paid"}</span>
    </button>
  );
}

/**
 * Staff/admin payment control. Works on any passport regardless of custody
 * status; the server action re-checks the acting role on every submission.
 */
export function PaymentToggle({
  passportId,
  paid,
  returnTo,
  compact = false,
}: {
  passportId: string;
  paid: boolean;
  returnTo: string;
  compact?: boolean;
}) {
  return (
    <form action={togglePaymentStatus}>
      <input type="hidden" name="passportId" value={passportId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <ToggleButton paid={paid} compact={compact} />
    </form>
  );
}
