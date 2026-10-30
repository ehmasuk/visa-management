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
 * Task 6.3 — Agency clicks "pay" on a DELIVERED passport it owns: creates a
 * Payment with status UNPAID. Ownership (agencyGmail) is enforced server-side
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

  const existing = await prisma.payment.findUnique({ where: { passportId: id } });
  if (existing) {
    if (existing.status === "PAID") {
      await fail("/agency", "This passport's payment is already approved (paid).");
    }
    if (!existing.rejectedAt) {
      // Already pending — idempotent no-op rather than a duplicate request.
      await ok("/agency", "A payment request for this passport is already awaiting staff approval.");
    }
    // Rejected → the agency may resubmit. Replace the rejected record with a
    // fresh request (never write rejectedAt back to null — on MongoDB that
    // materializes BSON null and polluted `isSet: false` pending filters).
    await prisma.$transaction([
      prisma.payment.delete({ where: { id: existing.id } }),
      prisma.payment.create({
        data: { passportId: id, amount: passport.fee, status: "UNPAID" },
      }),
    ]);
    await ok("/agency", "Payment request re-submitted for staff approval.");
  }

  try {
    await prisma.payment.create({
      data: { passportId: id, amount: passport.fee, status: "UNPAID" },
    });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await ok("/agency", "A payment request for this passport is already awaiting staff approval.");
    }
    throw error;
  }
  await ok("/agency", "Payment request submitted. Staff will review it.");
}

/**
 * Task 7.2 — Staff approves an unpaid payment request: status → PAID with
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
  if (payment.status !== "UNPAID") {
    await fail("/staff/payments", "Only unpaid requests can be approved.");
  }
  if (payment.rejectedAt) {
    await fail("/staff/payments", "This request was rejected — it must be re-submitted by the agency first.");
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
 * Task 7.2 — Staff rejects a request: status stays UNPAID and the rejection
 * is recorded (rejectedAt removes it from the pending list; the agency sees
 * the rejection and may re-submit).
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
  if (payment.status !== "UNPAID") {
    await fail("/staff/payments", "Only unpaid requests can be rejected.");
  }
  if (payment.rejectedAt) {
    await fail("/staff/payments", "This request is already recorded as rejected.");
  }

  await prisma.payment.update({
    where: { id },
    data: { status: "UNPAID", rejectedAt: new Date() },
  });
  revalidatePath("/staff/payments");
  revalidatePath("/agency");
  await setFlash("success", "Payment request rejected.");
  redirect("/staff/payments");
}
