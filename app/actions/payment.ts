"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAgency, requireStaff } from "@/lib/guards";
import { setFlash } from "@/lib/flash";

/**
 * Payment request/approval server actions (tasks 6.3, 7.1, 7.2).
 * Role guards re-verified server-side on every action.
 */

async function fail(path: string, message: string): Promise<never> {
  await setFlash("error", message);
  redirect(path);
}

// "ok" — the success flavor of the same one-shot flash toast pattern.
async function ok(path: string, message: string): Promise<never> {
  await setFlash("success", message);
  redirect(path);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function prismaErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

/**
 * Task 6.3 — Agency clicks "pay" on a DELIVERED passport it owns: moves the
 * passport's payment status from UNPAID to REQUESTED, creating a payment
 * request for staff approval. Ownership (agencyGmail) is enforced server-side
 * so an agency cannot request payment for another agency's passport.
 */
export async function requestPayment(formData: FormData) {
  const session = await requireAgency();
  const id = str(formData, "id");
  if (!id) await fail("/agency", "Missing passport id.");

  const passport = await prisma.passport.findUnique({ where: { id } });
  if (!passport) {
    await fail("/agency", "Passport record not found.");
    return;
  }

  // Data isolation: the acting agency may only act on its own passports.
  if (passport.agencyGmail !== session.user.email.toLowerCase()) {
    await fail("/agency", "This passport does not belong to your agency.");
  }
  if (passport.status !== "DELIVERED") {
    await fail("/agency", "Payment can only be requested on delivered passports.");
  }

  const payment = await prisma.payment.findUnique({ where: { passportId: id } });
  if (!payment) {
    await fail("/agency", "Payment record not found.");
    return;
  }

  if (payment.status === "PAID") {
    await fail("/agency", "This passport's payment is already approved (paid).");
    return;
  }
  if (payment.status === "REQUESTED") {
    // Already pending — idempotent no-op rather than a duplicate request.
    await ok("/agency", "A payment request for this passport is already awaiting staff approval.");
    return;
  }
  // status === "UNPAID" — new request or re-submission after rejection
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REQUESTED" },
  });
  await ok("/agency", "Payment request submitted. Staff will review it.");
}

/**
 * Task 7.2 — Staff approves a requested payment request: status → PAID with
 * the approval timestamp.
 */
export async function approvePayment(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  if (!id) await fail("/staff/payments", "Missing payment id.");

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    await fail("/staff/payments", "Payment request not found.");
    return;
  }
  if (payment.status !== "REQUESTED") {
    await fail("/staff/payments", "Only requested payments can be approved.");
  }

  await prisma.payment.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/staff/payments");
  revalidatePath("/agency");
  await setFlash("success", "Payment approved.");
  redirect("/staff/payments");
}

/**
 * Task 7.2 — Staff rejects a request: status returns to UNPAID. The agency
 * may re-submit later.
 */
export async function rejectPayment(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  if (!id) await fail("/staff/payments", "Missing payment id.");

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    await fail("/staff/payments", "Payment request not found.");
    return;
  }
  if (payment.status !== "REQUESTED") {
    await fail("/staff/payments", "Only requested payments can be rejected.");
  }

  await prisma.payment.update({
    where: { id },
    data: { status: "UNPAID" },
  });
  revalidatePath("/staff/payments");
  revalidatePath("/agency");
  await setFlash("success", "Payment request rejected.");
  redirect("/staff/payments");
}
