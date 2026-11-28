"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { setFlash } from "@/lib/flash";

/**
 * Agency-level payments. Admin records money received from an agency via a
 * collector. There is no per-passport payment state; an agency's due is
 * derived from its total passport fees minus these payments.
 */

const BASE = "/admin/payments";

async function fail(message: string): Promise<never> {
  await setFlash("error", message);
  redirect(BASE);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createPayment(formData: FormData) {
  const session = await requireAdmin();

  const agencyName = str(formData, "agencyName");
  const collectorName = str(formData, "collectorName");
  const amountRaw = str(formData, "amount");
  const countRaw = str(formData, "passportCount");

  const errors: string[] = [];
  if (!agencyName) errors.push("agency");
  if (!collectorName) errors.push("collector");
  if (!amountRaw) errors.push("amount");
  if (!countRaw) errors.push("passport count");
  if (errors.length > 0) {
    await fail(`Missing required field(s): ${errors.join(", ")}.`);
  }

  const amount = Number(amountRaw);
  if (!Number.isInteger(amount) || amount <= 0) {
    await fail("Amount must be a positive whole amount of taka (e.g. 40000).");
  }
  const passportCount = Number(countRaw);
  if (!Number.isInteger(passportCount) || passportCount < 0) {
    await fail("Passport count must be a non-negative whole number.");
  }

  const agency = await prisma.agency.findUnique({ where: { name: agencyName } });
  if (!agency) {
    await fail(`Agency "${agencyName}" is not registered. Ask the admin to add it first.`);
  }
  const collector = await prisma.collector.findUnique({ where: { name: collectorName } });
  if (!collector) {
    await fail(`Collector "${collectorName}" is not registered. Ask the admin to add them first.`);
  }

  await prisma.payment.create({
    data: {
      agencyName,
      amount,
      passportCount,
      collectorName,
      // The receiving admin comes from the session, never the form.
      receivedByName: session.user.name ?? session.user.email ?? "",
      receivedByRole: session.user.role,
      receivedByEmail: session.user.email ?? "",
    },
  });

  revalidatePath(BASE);
  await setFlash("success", "Payment recorded.");
  redirect(BASE);
}
