"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { requireStaff, requireStaffOrAdmin } from "@/lib/guards";
import { setFlash } from "@/lib/flash";
import { NEXT_STAGE, STAGES, statusLabel, type PassportStage } from "@/lib/passport-format";

/**
 * Passport server actions: entry (task 4.1/4.2), full-details edit, comment
 * edit (4.3), status change with delivery rules (5.1–5.3). Entry stays a
 * staff-only workflow; comments, statuses, and details are open to both
 * staff and admin (requireStaffOrAdmin). Every action re-verifies the acting
 * user's role server-side and stamps the last editor on the passport.
 */

const BASE = "/staff/passport-entry";

/** List pages hosting the shared passport card forms. */
const LIST_HOMES = ["/staff/passports", "/admin/passports"] as const;

async function fail(message: string, redirectTo: string = BASE): Promise<never> {
  await setFlash("error", message);
  redirect(redirectTo);
}

/**
 * Where a list-page form should bounce back to: the page that rendered it.
 * `returnTo` is supplied as a hidden input by every card form; anything the
 * allow-list does not recognize falls back to the staff list.
 */
function listHome(formData: FormData): string {
  const returnTo = str(formData, "returnTo");
  return (LIST_HOMES as readonly string[]).includes(returnTo) ? returnTo : BASE;
}

/** Both list pages re-render after any passport write. */
function revalidateListPages(): void {
  revalidatePath("/staff/passports");
  revalidatePath("/admin/passports");
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Last-editor stamp: the internal actor (STAFF or ADMIN) behind this write,
 * denormalized onto the passport (house pattern — like agencyGmail or
 * AdminAudit) so attribution stays readable without joins and reflects who
 * did the change at the time it happened.
 */
function lastEditorStamp(session: Session) {
  return {
    lastEditedByRole: session.user.role,
    lastEditedByName: session.user.name ?? session.user.email ?? "",
    lastEditedByEmail: session.user.email ?? "",
    lastEditedAt: new Date(),
  };
}

/**
 * Task 4.1/4.2 — Create a passport entry.
 * Eight required fields (agency, collector, visa type, service, passport
 * number, holder, contact, fee) + the optional comment. receiptDate is
 * ALWAYS the system timestamp (any posted value is ignored — spec: receipt
 * date not user-provided). Status starts at RECEIVED. agencyGmail is
 * resolved from the registry as the ownership reference for the agency
 * dashboard. Visa type and service are validated against their admin
 * registries (staff must select from them, same as agency/collector).
 * The creating staff member is stamped as the passport's initial editor.
 */
export async function createPassport(formData: FormData) {
  const session = await requireStaff();

  const agencyName = str(formData, "agencyName");
  const collectorName = str(formData, "collectorName");
  const visaTypeName = str(formData, "visaTypeName");
  const serviceName = str(formData, "serviceName");
  const passportNumber = str(formData, "passportNumber");
  const holderName = str(formData, "holderName");
  const contactNumber = str(formData, "contactNumber");
  const comment = str(formData, "comment");
  const feeRaw = str(formData, "fee");

  const errors: string[] = [];
  if (!agencyName) errors.push("agency name");
  if (!collectorName) errors.push("collector name");
  if (!visaTypeName) errors.push("visa type");
  if (!serviceName) errors.push("service");
  if (!passportNumber) errors.push("passport number");
  if (!holderName) errors.push("passport holder name");
  if (!contactNumber) errors.push("contact number");
  if (!feeRaw) errors.push("fee");
  if (errors.length > 0) {
    await fail(`Missing required field(s): ${errors.join(", ")}.`);
  }

  const fee = Number(feeRaw);
  if (!Number.isInteger(fee) || fee < 0) {
    await fail("Fee must be a non-negative whole amount of taka (e.g. 3500).");
  }

  // Free-text names are validated against the admin registry (recorded
  // assumption): the agency must exist, and its Gmail becomes the
  // ownership reference. Collector must exist in the registry. Visa type
  // and service must be registered there too — passport entries record
  // what the business offers, not arbitrary text.
  const agency = await prisma.agency.findUnique({
    where: { name: agencyName },
  });
  if (!agency) {
    await fail(`Agency "${agencyName}" is not registered. Ask the admin to allow-list it first.`);
    return;
  }
  const collector = await prisma.collector.findUnique({
    where: { name: collectorName },
  });
  if (!collector) {
    await fail(`Collector "${collectorName}" is not registered. Ask the admin to add them first.`);
  }
  const visaType = await prisma.visaType.findUnique({
    where: { name: visaTypeName },
  });
  if (!visaType) {
    await fail(`Visa type "${visaTypeName}" is not registered. Ask the admin to add it first.`);
  }
  const service = await prisma.service.findUnique({
    where: { name: serviceName },
  });
  if (!service) {
    await fail(`Service "${serviceName}" is not registered. Ask the admin to add it first.`);
  }

  const existingNumber = await prisma.passport.findUnique({
    where: { passportNumber },
  });
  if (existingNumber) {
    await fail(`Passport number "${passportNumber}" is already recorded (entered for ${existingNumber.holderName}).`);
  }

  await prisma.passport.create({
    data: {
      agencyName,
      agencyGmail: agency.gmail,
      collectorName,
      visaTypeName,
      serviceName,
      passportNumber,
      holderName,
      contactNumber,
      comment,
      fee,
      // status defaults to RECEIVED; receiptDate = creation timestamp
      receiptDate: new Date(),
      // creating staff member = initial last editor
      ...lastEditorStamp(session),
      // Every passport starts with an unpaid payment record
      payment: {
        create: {
          amount: fee,
          status: "UNPAID",
        },
      },
    },
  });

  revalidateListPages();
  await setFlash("success", "Passport received.");
  redirect(BASE);
}

/**
 * Full-details edit: allows staff and admin to correct any user-maintained
 * field of an existing passport. Validation mirrors entry exactly:
 * registry-backed selections (selector's record must exist), a non-negative
 * whole taka fee, and a passport number unique across passports excluding
 * this one (re-stating one's own number is fine). Changing the agency
 * re-resolves its registered Gmail as the ownership reference.
 * System-managed fields (status, receiptDate, deliveryDate,
 * deliveryCollectorName) are deliberately never read from the form — the
 * status/delivery flow governs them, so posted values for them are ignored
 * by construction. On success the user returns to the detail view.
 */
export async function updatePassportDetails(formData: FormData) {
  const session = await requireStaffOrAdmin();

  const id = str(formData, "id");
  if (!id) await fail("Missing passport id.");
  const current = await prisma.passport.findUnique({ where: { id } });
  if (!current) {
    await fail("Passport record not found.");
    return;
  }

  const agencyName = str(formData, "agencyName");
  const collectorName = str(formData, "collectorName");
  const visaTypeName = str(formData, "visaTypeName");
  const serviceName = str(formData, "serviceName");
  const passportNumber = str(formData, "passportNumber");
  const holderName = str(formData, "holderName");
  const contactNumber = str(formData, "contactNumber");
  // Comment optional, same as entry; an empty save clears it.
  const comment = str(formData, "comment");
  const feeRaw = str(formData, "fee");

  const errors: string[] = [];
  if (!agencyName) errors.push("agency name");
  if (!collectorName) errors.push("collector name");
  if (!visaTypeName) errors.push("visa type");
  if (!serviceName) errors.push("service");
  if (!passportNumber) errors.push("passport number");
  if (!holderName) errors.push("passport holder name");
  if (!contactNumber) errors.push("contact number");
  if (!feeRaw) errors.push("fee");
  if (errors.length > 0) {
    await fail(`Missing required field(s): ${errors.join(", ")}.`, `/passports/${id}/edit`);
  }

  const fee = Number(feeRaw);
  if (!Number.isInteger(fee) || fee < 0) {
    await fail(
      "Fee must be a non-negative whole amount of taka (e.g. 3500).",
      `/passports/${id}/edit`
    );
  }

  // Same registry-backed selections as entry: names must resolve to a
  // registered record, and the selected agency's Gmail becomes the
  // ownership reference (agency change effectively re-homes the passport).
  const agency = await prisma.agency.findUnique({ where: { name: agencyName } });
  if (!agency) {
    await fail(
      `Agency "${agencyName}" is not registered. Ask the admin to allow-list it first.`,
      `/passports/${id}/edit`
    );
    return;
  }
  const collector = await prisma.collector.findUnique({ where: { name: collectorName } });
  if (!collector) {
    await fail(`Collector "${collectorName}" is not registered. Ask the admin to add them first.`, `/passports/${id}/edit`);
  }
  const visaType = await prisma.visaType.findUnique({ where: { name: visaTypeName } });
  if (!visaType) {
    await fail(`Visa type "${visaTypeName}" is not registered. Ask the admin to add it first.`, `/passports/${id}/edit`);
  }
  const service = await prisma.service.findUnique({ where: { name: serviceName } });
  if (!service) {
    await fail(`Service "${serviceName}" is not registered. Ask the admin to add it first.`, `/passports/${id}/edit`);
  }

  // Unique across passports EXCLUDING this one: hitting another passport's
  // number is a conflict, but the passport may keep or restate its own.
  const conflicting = await prisma.passport.findUnique({ where: { passportNumber } });
  if (conflicting && conflicting.id !== id) {
    await fail(
      `Passport number "${passportNumber}" is already recorded (entered for ${conflicting.holderName}).`,
      `/passports/${id}/edit`
    );
  }

  await prisma.passport.update({
    where: { id },
    data: {
      agencyName,
      agencyGmail: agency.gmail,
      collectorName,
      visaTypeName,
      serviceName,
      passportNumber,
      holderName,
      contactNumber,
      comment,
      fee,
      ...lastEditorStamp(session),
    },
  });

  revalidateListPages();
  revalidatePath(`/passports/${id}`);
  await setFlash("success", "Passport updated.");
  redirect(`/passports/${id}`);
}

/**
 * Task 4.3 — Comment edit: updates ONLY the comment, preserving every other
 * field. Allowed any time (staff or admin), stamps the editor, overwrites
 * without a history trail (recorded assumption).
 */
export async function updatePassportComment(formData: FormData) {
  const session = await requireStaffOrAdmin();
  const returnTo = listHome(formData);
  const id = str(formData, "id");
  const comment = str(formData, "comment");
  if (!id) await fail("Missing passport id.", returnTo);
  if (!comment) await fail("Comment cannot be empty.", returnTo);
  await prisma.passport.update({
    where: { id },
    data: { comment, ...lastEditorStamp(session) },
  });
  revalidateListPages();
  revalidatePath(`/passports/${id}`);
  await setFlash("success", "Comment saved.");
  redirect(returnTo);
}

/**
 * Tasks 5.1–5.3 (revised) — Stage advance on the custody pipeline.
 * Passports move EXACTLY one stage forward per call through
 * RECEIVED → UNDER_REVIEW → SUBMITTED → DELIVERED; skips, backward moves and
 * re-advancing a delivered passport are rejected. UNDER_REVIEW stamps
 * underReviewDate and SUBMITTED stamps submittedDate with the transition
 * timestamp (never user-provided). DELIVERED keeps the delivery rules:
 * a registered delivery collector is required, deliveryDate becomes the
 * transition timestamp (5.3), and the intake collector (collectorName,
 * recorded at entry) is never overwritten. Staff and admin both drive the
 * flow; every transition stamps the acting user as the passport's last
 * editor.
 */
export async function updatePassportStatus(formData: FormData) {
  const session = await requireStaffOrAdmin();
  const returnTo = listHome(formData);
  const id = str(formData, "id");
  const statusRaw = str(formData, "status");
  const deliveryCollectorName = str(formData, "deliveryCollectorName");

  if (!id) await fail("Missing passport id.", returnTo);
  if (!(STAGES as readonly string[]).includes(statusRaw)) {
    await fail(`Invalid status "${statusRaw}".`, returnTo);
  }
  const status = statusRaw as PassportStage;
  const current = await prisma.passport.findUnique({ where: { id } });
  if (!current) {
    await fail("Passport record not found.", returnTo);
    return;
  }

  const next = NEXT_STAGE[current.status as PassportStage];
  if (next === null) {
    await fail(
      "Delivered is final: a delivered passport cannot move to another stage.",
      returnTo
    );
  }
  if (next !== status) {
    await fail(
      next
        ? `Wrong stage order: from ${statusLabel(current.status)} the only possible next stage is ${statusLabel(next)}.`
        : "Passport record not found.",
      returnTo
    );
  }

  if (status === "DELIVERED") {
    if (!deliveryCollectorName) {
      await fail("Delivered status requires a delivery collector assignment.", returnTo);
    }
    const collector = await prisma.collector.findUnique({
      where: { name: deliveryCollectorName },
    });
    if (!collector) {
      await fail(
        `Delivery collector "${deliveryCollectorName}" is not registered. Cannot deliver to an unknown collector.`,
        returnTo
      );
    }
    await prisma.passport.update({
      where: { id },
      data: {
        status,
        // Task 5.3 — delivery date is the delivery timestamp, never user-entered
        deliveryDate: new Date(),
        // "Delivery man" records on its own field; the intake collector
        // (collectorName) from the entry form stays untouched.
        deliveryCollectorName,
        ...lastEditorStamp(session),
      },
    });
  } else {
    await prisma.passport.update({
      where: { id },
      data: {
        status,
        // Milestone stamps are set by the pipeline the first time the
        // passport enters the stage; later transitions never touch earlier
        // milestones. Any posted date value for them is ignored.
        underReviewDate: status === "UNDER_REVIEW" ? new Date() : current.underReviewDate,
        submittedDate: status === "SUBMITTED" ? new Date() : current.submittedDate,
        deliveryDate: current.deliveryDate,
        deliveryCollectorName: current.deliveryCollectorName,
        ...lastEditorStamp(session),
      },
    });
  }

  revalidateListPages();
  revalidatePath(`/passports/${id}`);
  await setFlash(
    "success",
    status === "DELIVERED"
      ? "Passport delivered."
      : status === "UNDER_REVIEW"
        ? "Passport marked under review."
        : "Passport submitted."
  );
  redirect(returnTo);
}
