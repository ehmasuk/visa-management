"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/guards";
import { setFlash } from "@/lib/flash";
import { lastEditorStamp } from "@/lib/last-editor";

/**
 * Payment settlement is handled internally. There is no agency request and
 * no approval queue: staff and admins flip a passport's payment directly
 * between PAID and UNPAID from the detail view or the desk lists. Agencies
 * are client records only and never interact with payment.
 */

const LIST_HOMES = [
  "/staff/passports",
  "/admin/passports",
  "/admin/reports",
] as const;

async function fail(path: string, message: string): Promise<never> {
  await setFlash("error", message);
  redirect(path);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Only known internal surfaces may be used as a post-action redirect. */
function safeReturnTo(formData: FormData, passportId: string): string {
  const detail = `/passports/${passportId}`;
  const candidate = str(formData, "returnTo");
  if (candidate === detail || (LIST_HOMES as readonly string[]).includes(candidate)) {
    return candidate;
  }
  return detail;
}

/**
 * Flip a passport's payment status. Any internal operator (STAFF or ADMIN)
 * may act on any passport, regardless of its custody status. The settlement
 * amount always follows the passport's current fee, and paidAt is stamped
 * only while the payment is PAID (cleared when it is marked unpaid).
 */
export async function togglePaymentStatus(formData: FormData) {
  const session = await requireStaffOrAdmin();

  const passportId = str(formData, "passportId");
  if (!passportId) await fail("/staff/passports", "Missing passport id.");

  const returnTo = safeReturnTo(formData, passportId);
  const passport = await prisma.passport.findUnique({
    where: { id: passportId },
    include: { payment: true },
  });
  if (!passport) {
    await fail(returnTo, "Passport record not found.");
    return;
  }

  const markPaid = passport.payment?.status !== "PAID";
  const status = markPaid ? "PAID" : "UNPAID";
  const paidAt = markPaid ? new Date() : null;

  // One write stamps the editor on the passport and keeps the 1:1 payment
  // record in sync, creating it if an older passport never had one.
  await prisma.passport.update({
    where: { id: passportId },
    data: {
      ...lastEditorStamp(session),
      payment: {
        upsert: {
          create: { amount: passport.fee, status, paidAt },
          update: { amount: passport.fee, status, paidAt },
        },
      },
    },
  });

  for (const path of [
    ...LIST_HOMES,
    "/staff",
    "/admin",
    `/passports/${passportId}`,
  ]) {
    revalidatePath(path);
  }

  await setFlash("success", markPaid ? "Payment marked as paid." : "Payment marked as unpaid.");
  redirect(returnTo);
}
