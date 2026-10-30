"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { setFlash } from "@/lib/flash";
import { requireAdmin } from "@/lib/guards";
import { normalizeEmail } from "@/lib/registry";

/**
 * Admin registry CRUD server actions (branches, agencies with Gmail
 * allow-list, collectors, staff). Every action re-verifies the acting user's
 * role server-side before touching data.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function fail(basePath: string, message: string): Promise<never> {
  await setFlash("error", message);
  redirect(basePath);
}

function prismaErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

function parseId(formData: FormData): string | null {
  const id = formData.get("id");
  return typeof id === "string" && id.length > 0 ? id : null;
}

function parseName(formData: FormData): string {
  return String(formData.get("name") ?? "").trim();
}

// ---------- Branches ----------

export async function createBranch(formData: FormData) {
  await requireAdmin();
  const name = parseName(formData);
  if (!name) await fail("/admin/branches", "Branch name is required.");
  try {
    await prisma.branch.create({ data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/branches", `A branch named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/branches");
  await setFlash("success", "Branch added.");
  redirect("/admin/branches");
}

export async function updateBranch(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  const name = parseName(formData);
  if (!id) {
    await fail("/admin/branches", "Missing branch id.");
    return;
  }
  if (!name) await fail("/admin/branches", "Branch name is required.");
  try {
    await prisma.branch.update({ where: { id }, data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/branches", `A branch named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/branches");
  await setFlash("success", "Branch updated.");
  redirect("/admin/branches");
}

export async function deleteBranch(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  if (!id) {
    await fail("/admin/branches", "Missing branch id.");
    return;
  }
  await prisma.branch.delete({ where: { id } });
  revalidatePath("/admin/branches");
  await setFlash("success", "Branch deleted.");
  redirect("/admin/branches");
}

// ---------- Agencies (Gmail allow-list) ----------

export async function createAgency(formData: FormData) {
  await requireAdmin();
  const name = parseName(formData);
  const gmail = normalizeEmail(String(formData.get("gmail") ?? ""));
  if (!name) await fail("/admin/agencies", "Agency name is required.");
  if (!gmail || !EMAIL_RE.test(gmail)) {
    await fail("/admin/agencies", "A valid Gmail address is required.");
  }
  try {
    await prisma.agency.create({ data: { name, gmail } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail(
        "/admin/agencies",
        'That agency name or Gmail is already registered (already allow-listed or taken).'
      );
    }
    throw error;
  }
  revalidatePath("/admin/agencies");
  await setFlash("success", "Agency allow-listed.");
  redirect("/admin/agencies");
}

export async function updateAgency(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  const name = parseName(formData);
  const gmail = normalizeEmail(String(formData.get("gmail") ?? ""));
  if (!id) {
    await fail("/admin/agencies", "Missing agency id.");
    return;
  }
  if (!name) await fail("/admin/agencies", "Agency name is required.");
  if (!gmail || !EMAIL_RE.test(gmail)) {
    await fail("/admin/agencies", "A valid Gmail address is required.");
  }
  // Guard the design risk: passports reference the Gmail — if any passport
  // uses the old address, disallow changing it (ownership would orphan).
  const existing = await prisma.agency.findUnique({ where: { id } });
  if (!existing) {
    await fail("/admin/agencies", "Agency not found.");
    return;
  }
  if (existing.gmail !== gmail) {
    const linked = await prisma.passport.count({ where: { agencyGmail: existing.gmail } });
    if (linked > 0) {
      await fail(
        "/admin/agencies",
        `Cannot change the Gmail: ${linked} passport(s) reference ${existing.gmail}. Agency Gmail is treated as immutable once passports exist.`
      );
    }
  }
  try {
    await prisma.agency.update({ where: { id }, data: { name, gmail } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail(
        "/admin/agencies",
        "That agency name or Gmail is already registered (already allow-listed or taken)."
      );
    }
    throw error;
  }
  revalidatePath("/admin/agencies");
  await setFlash("success", "Agency updated.");
  redirect("/admin/agencies");
}

export async function deleteAgency(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  if (!id) {
    await fail("/admin/agencies", "Missing agency id.");
    return;
  }
  const existing = await prisma.agency.findUnique({ where: { id } });
  if (!existing) {
    await fail("/admin/agencies", "Agency not found.");
    return;
  }
  const linked = await prisma.passport.count({ where: { agencyGmail: existing.gmail } });
  if (linked > 0) {
    await fail(
      "/admin/agencies",
      `Cannot remove: ${linked} passport(s) reference ${existing.gmail}. Delete is blocked so passport ownership stays intact.`
    );
  }
  await prisma.agency.delete({ where: { id } });
  revalidatePath("/admin/agencies");
  await setFlash("success", "Agency removed.");
  redirect("/admin/agencies");
}

// ---------- Collectors ----------

export async function createCollector(formData: FormData) {
  await requireAdmin();
  const name = parseName(formData);
  if (!name) await fail("/admin/collectors", "Collector name is required.");
  try {
    await prisma.collector.create({ data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/collectors", `A collector named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/collectors");
  await setFlash("success", "Collector added.");
  redirect("/admin/collectors");
}

export async function updateCollector(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  const name = parseName(formData);
  if (!id) {
    await fail("/admin/collectors", "Missing collector id.");
    return;
  }
  if (!name) await fail("/admin/collectors", "Collector name is required.");
  try {
    await prisma.collector.update({ where: { id }, data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/collectors", `A collector named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/collectors");
  await setFlash("success", "Collector updated.");
  redirect("/admin/collectors");
}

export async function deleteCollector(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  if (!id) {
    await fail("/admin/collectors", "Missing collector id.");
    return;
  }
  await prisma.collector.delete({ where: { id } });
  revalidatePath("/admin/collectors");
  await setFlash("success", "Collector removed.");
  redirect("/admin/collectors");
}

// ---------- Visa types (name-only registry) ----------

export async function createVisaType(formData: FormData) {
  await requireAdmin();
  const name = parseName(formData);
  if (!name) await fail("/admin/visa-types", "Visa type name is required.");
  try {
    await prisma.visaType.create({ data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/visa-types", `A visa type named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/visa-types");
  await setFlash("success", "Visa type added.");
  redirect("/admin/visa-types");
}

export async function updateVisaType(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  const name = parseName(formData);
  if (!id) {
    await fail("/admin/visa-types", "Missing visa type id.");
    return;
  }
  if (!name) await fail("/admin/visa-types", "Visa type name is required.");
  try {
    await prisma.visaType.update({ where: { id }, data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/visa-types", `A visa type named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/visa-types");
  await setFlash("success", "Visa type updated.");
  redirect("/admin/visa-types");
}

export async function deleteVisaType(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  if (!id) {
    await fail("/admin/visa-types", "Missing visa type id.");
    return;
  }
  await prisma.visaType.delete({ where: { id } });
  revalidatePath("/admin/visa-types");
  await setFlash("success", "Visa type removed.");
  redirect("/admin/visa-types");
}

// ---------- Services (name-only registry) ----------

export async function createService(formData: FormData) {
  await requireAdmin();
  const name = parseName(formData);
  if (!name) await fail("/admin/services", "Service name is required.");
  try {
    await prisma.service.create({ data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/services", `A service named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/services");
  await setFlash("success", "Service added.");
  redirect("/admin/services");
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  const name = parseName(formData);
  if (!id) {
    await fail("/admin/services", "Missing service id.");
    return;
  }
  if (!name) await fail("/admin/services", "Service name is required.");
  try {
    await prisma.service.update({ where: { id }, data: { name } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/services", `A service named "${name}" already exists.`);
    }
    throw error;
  }
  revalidatePath("/admin/services");
  await setFlash("success", "Service updated.");
  redirect("/admin/services");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  if (!id) {
    await fail("/admin/services", "Missing service id.");
    return;
  }
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  await setFlash("success", "Service removed.");
  redirect("/admin/services");
}

// ---------- Staff (Gmail allow-list) ----------

export async function createStaff(formData: FormData) {
  await requireAdmin();
  const name = parseName(formData);
  const gmail = normalizeEmail(String(formData.get("gmail") ?? ""));
  const role = String(formData.get("role") ?? "STAFF");
  if (!name) await fail("/admin/staff", "Staff name is required.");
  if (!gmail || !EMAIL_RE.test(gmail)) {
    await fail("/admin/staff", "A valid Gmail address is required.");
  }
  if (role !== "STAFF") {
    await fail(
      "/admin/staff",
      "Staff registry entries use the STAFF role — admin accounts are bootstrapped separately (single-admin invariant)."
    );
  }
  try {
    await prisma.staff.create({ data: { name, gmail, role: "STAFF" } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/staff", "That staff name or Gmail is already registered.");
    }
    throw error;
  }
  revalidatePath("/admin/staff");
  await setFlash("success", "Staff allow-listed.");
  redirect("/admin/staff");
}

export async function updateStaff(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  const name = parseName(formData);
  const gmail = normalizeEmail(String(formData.get("gmail") ?? ""));
  const role = String(formData.get("role") ?? "STAFF");
  if (!id) {
    await fail("/admin/staff", "Missing staff id.");
    return;
  }
  if (!name) await fail("/admin/staff", "Staff name is required.");
  if (!gmail || !EMAIL_RE.test(gmail)) {
    await fail("/admin/staff", "A valid Gmail address is required.");
  }
  if (role !== "STAFF") {
    await fail(
      "/admin/staff",
      "Staff registry entries use the STAFF role — admin accounts are bootstrapped separately (single-admin invariant)."
    );
  }
  try {
    await prisma.staff.update({ where: { id }, data: { name, gmail, role: "STAFF" } });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      await fail("/admin/staff", "That staff name or Gmail is already registered.");
    }
    throw error;
  }
  revalidatePath("/admin/staff");
  await setFlash("success", "Staff allow-list updated.");
  redirect("/admin/staff");
}

export async function deleteStaff(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  if (!id) {
    await fail("/admin/staff", "Missing staff id.");
    return;
  }
  await prisma.staff.delete({ where: { id } });
  revalidatePath("/admin/staff");
  await setFlash("success", "Staff removed.");
  redirect("/admin/staff");
}
