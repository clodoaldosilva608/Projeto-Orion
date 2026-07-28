"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { supabaseId: user.id } });
}

// === TRAININGS ===

export async function listTrainingsAction(category?: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const where: any = { companyId: user.companyId, deletedAt: null, isActive: true };
  if (category && category !== "all") where.category = category;
  const trainings = await prisma.training.findMany({
    where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { progress: { where: { userId: user.id } } },
  });
  return {
    data: trainings.map((t) => ({
      ...t, id: t.id.toString(), companyId: t.companyId.toString(),
      createdAt: t.createdAt.toISOString(),
      progress: t.progress[0] ? {
        status: t.progress[0].status, progressPct: t.progress[0].progress,
        completedAt: t.progress[0].completedAt?.toISOString() ?? null,
      } : null,
    })), error: null,
  };
}

export async function createTrainingAction(data: {
  title: string; description?: string; category?: string; format?: string;
  contentUrl?: string; durationMin?: number; isRequired?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  if (!data.title?.trim()) return { data: null, error: "Título obrigatório" };
  const t = await prisma.training.create({
    data: {
      companyId: user.companyId, title: data.title.trim(),
      description: data.description?.trim() || null,
      category: (data.category ?? "other") as any,
      format: (data.format ?? "video") as any,
      contentUrl: data.contentUrl || null, durationMin: data.durationMin ?? null,
      isRequired: data.isRequired ?? false, createdBy: user.id,
    },
  });
  revalidatePath("/treinamentos");
  return { data: { id: t.id.toString() }, error: null };
}

export async function updateTrainingProgressAction(trainingId: string, progress: number, status?: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const progressData: any = { progress, status: status ?? (progress >= 100 ? "completed" : "in_progress") };
  if (progress >= 100 && status !== "completed") {
    progressData.status = "completed";
    progressData.completedAt = new Date();
    progressData.certificate = `CERT-${trainingId}-${user.id.toString()}-${Date.now()}`;
  }
  if (progress > 0 && !status) progressData.startedAt = progressData.startedAt ?? new Date();
  await prisma.trainingProgress.upsert({
    where: { trainingId_userId: { trainingId: BigInt(trainingId), userId: user.id } },
    update: progressData,
    create: { trainingId: BigInt(trainingId), userId: user.id, companyId: user.companyId, ...progressData },
  });
  revalidatePath("/treinamentos");
  return { data: { ok: true }, error: null };
}

export async function deleteTrainingAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  await prisma.training.updateMany({
    where: { id: BigInt(id), companyId: user.companyId },
    data: { deletedAt: new Date(), isActive: false },
  });
  revalidatePath("/treinamentos");
  return { data: { ok: true }, error: null };
}

// === DOCUMENTS ===

export async function listDocumentsAction(userId?: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const targetUserId = userId ? BigInt(userId) : user.id;
  const docs = await prisma.userDocument.findMany({
    where: { companyId: user.companyId, userId: targetUserId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return {
    data: docs.map((d) => ({
      ...d, id: d.id.toString(), companyId: d.companyId.toString(), userId: d.userId.toString(),
      createdAt: d.createdAt.toISOString(), expiresAt: d.expiresAt?.toISOString() ?? null,
    })), error: null,
  };
}

export async function uploadDocumentAction(data: {
  title: string; description?: string; type?: string;
  fileUrl: string; fileName: string; fileSize?: number; mimeType?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  if (!data.title?.trim() || !data.fileUrl) return { data: null, error: "Título e arquivo obrigatórios" };
  const doc = await prisma.userDocument.create({
    data: {
      companyId: user.companyId, userId: user.id,
      title: data.title.trim(), description: data.description?.trim() || null,
      type: (data.type ?? "other") as any,
      fileUrl: data.fileUrl, fileName: data.fileName,
      fileSize: data.fileSize, mimeType: data.mimeType,
    },
  });
  revalidatePath("/documentos");
  return { data: { id: doc.id.toString() }, error: null };
}

export async function deleteDocumentAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  await prisma.userDocument.updateMany({
    where: { id: BigInt(id), companyId: user.companyId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/documentos");
  return { data: { ok: true }, error: null };
}
