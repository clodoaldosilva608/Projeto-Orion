"use server";

/**
 * P14 — Fábrica de Software server actions.
 *
 * Per PIVOT_PLAN.md: Orion agora é "Plataforma Inteligente de
 * Desenvolvimento de Software". Esta é a entidade central "Projeto"
 * recomendada pela consultoria.
 *
 * Models:
 *   - SoftwareProject: entidade central (substitui SaasProject genérico)
 *   - ProjectBriefing: briefing estruturado do cliente
 *   - ProjectTemplate: templates reutilizáveis (catálogo)
 *   - ProjectStage: estágios do pipeline de desenvolvimento
 */
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });
  if (!dbUser) return null;
  return dbUser;
}

// ================================================================
// DASHBOARD — getFabricaStatsAction
// ================================================================

export async function getFabricaStatsAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const [projects, briefings, templates, clients, deliveredThisMonth] = await Promise.all([
      prisma.softwareProject.count({
        where: { companyId: user.companyId, deletedAt: null },
      }),
      prisma.projectBriefing.count({
        where: { companyId: user.companyId },
      }),
      prisma.projectTemplate.count({
        where: { isActive: true },
      }),
      prisma.saasClient.count(),
      prisma.softwareProject.count({
        where: {
          companyId: user.companyId,
          status: "delivered",
          deliveredAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Projects by status
    const byStatus = await prisma.softwareProject.groupBy({
      by: ["status"],
      where: { companyId: user.companyId, deletedAt: null },
      _count: true,
    });
    const statusCounts: Record<string, number> = {};
    for (const s of byStatus) statusCounts[s.status] = s._count;

    // Recent projects (last 5)
    const recent = await prisma.softwareProject.findMany({
      where: { companyId: user.companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        briefing: { select: { clientName: true, clientCompany: true } },
      },
    });

    return {
      data: {
        totals: {
          projects,
          briefings,
          templates,
          clients,
          deliveredThisMonth,
        },
        byStatus: statusCounts,
        recentProjects: recent.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          status: p.status,
          progress: p.progress,
          clientName: p.briefing?.clientName ?? "—",
          clientCompany: p.briefing?.clientCompany ?? null,
          createdAt: p.createdAt.toISOString(),
          estimatedEndDate: p.estimatedEndDate?.toISOString() ?? null,
        })),
      },
      error: null,
    };
  } catch (e) {
    console.error("getFabricaStatsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// PROJECTS — list + get + create
// ================================================================

export async function listSoftwareProjectsAction(filter?: {
  status?: string;
  clientId?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const where: any = { companyId: user.companyId, deletedAt: null };
    if (filter?.status && filter.status !== "all") where.status = filter.status;
    if (filter?.clientId) where.clientId = filter.clientId;

    const projects = await prisma.softwareProject.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        briefing: {
          select: { clientName: true, clientCompany: true, clientEmail: true },
        },
        template: {
          select: { displayName: true, iconEmoji: true, iconColor: true },
        },
        stages: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, status: true, sortOrder: true },
        },
      },
    });

    return {
      data: projects.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        status: p.status,
        progress: p.progress,
        stack: p.stack,
        keyFeatures: p.keyFeatures,
        startDate: p.startDate?.toISOString() ?? null,
        estimatedEndDate: p.estimatedEndDate?.toISOString() ?? null,
        deliveredAt: p.deliveredAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
        repositoryUrl: p.repositoryUrl,
        demoUrl: p.demoUrl,
        productionUrl: p.productionUrl,
        client: p.briefing
          ? {
              name: p.briefing.clientName,
              company: p.briefing.clientCompany,
              email: p.briefing.clientEmail,
            }
          : null,
        template: p.template
          ? {
              name: p.template.displayName,
              emoji: p.template.iconEmoji,
              color: p.template.iconColor,
            }
          : null,
        stages: p.stages.map((s) => ({
          id: s.id.toString(),
          name: s.name,
          status: s.status,
          sortOrder: s.sortOrder,
        })),
        stagesCount: p.stages.length,
        completedStages: p.stages.filter((s) => s.status === "completed").length,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function createSoftwareProjectAction(data: {
  name: string;
  description?: string;
  clientId?: string;
  templateId?: string;
  keyFeatures?: string[];
  successCriteria?: string;
  budgetCents?: number;
  estimatedWeeks?: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    if (!data.name?.trim()) {
      return { data: null, error: "Nome do projeto é obrigatório" };
    }

    // Calculate estimated end date from weeks
    let estimatedEndDate: Date | null = null;
    if (data.estimatedWeeks) {
      estimatedEndDate = new Date();
      estimatedEndDate.setDate(estimatedEndDate.getDate() + data.estimatedWeeks * 7);
    }

    const project = await prisma.softwareProject.create({
      data: {
        companyId: user.companyId,
        clientId: data.clientId || null,
        templateId: data.templateId ? BigInt(data.templateId) : null,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        status: "briefing",
        keyFeatures: (data.keyFeatures ?? []) as any,
        successCriteria: data.successCriteria?.trim() || null,
        budgetCents: data.budgetCents ?? null,
        startDate: new Date(),
        estimatedEndDate,
        createdBy: user.id,
      },
    });

    // Create default pipeline stages
    const defaultStages = [
      { name: "Briefing", sortOrder: 0 },
      { name: "Arquitetura", sortOrder: 1 },
      { name: "Desenvolvimento", sortOrder: 2 },
      { name: "Testes", sortOrder: 3 },
      { name: "Deploy", sortOrder: 4 },
      { name: "Entrega", sortOrder: 5 },
    ];
    for (const stage of defaultStages) {
      await prisma.projectStage.create({
        data: {
          projectId: project.id,
          name: stage.name,
          sortOrder: stage.sortOrder,
          status: stage.sortOrder === 0 ? "active" : "pending",
        },
      });
    }

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "software_projects",
      recordId: project.id,
      newValue: { name: project.name, status: project.status },
    });

    revalidatePath("/fabrica");
    revalidatePath("/fabrica/projetos");
    return { data: { id: project.id.toString() }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// TEMPLATES — list + seed official
// ================================================================

export async function listProjectTemplatesAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    // Auto-seed official templates on first access
    await seedOfficialTemplatesAction();

    const templates = await prisma.projectTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ isOfficial: "desc" }, { usageCount: "desc" }, { displayName: "asc" }],
    });

    return {
      data: templates.map((t) => ({
        ...t,
        id: t.id.toString(),
        companyId: t.companyId?.toString() ?? null,
        stackDefault: t.stackDefault,
        featuresDefault: t.featuresDefault,
        defaultTimeline: t.defaultTimeline,
        estimatedPriceBRL: t.estimatedPriceCents / 100,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

const OFFICIAL_TEMPLATES = [
  {
    name: "ecommerce",
    displayName: "E-commerce",
    description: "Loja virtual completa com catálogo, carrinho, checkout, pagamentos e painel admin.",
    category: "e-commerce",
    iconEmoji: "🛒",
    iconColor: "#10b981",
    stackDefault: ["nextjs", "prisma", "supabase", "tailwind", "stripe"],
    featuresDefault: ["catálogo", "carrinho", "checkout", "pagamentos", "painel admin", "estoque", "cupons"],
    estimatedHours: 120,
    estimatedPriceCents: 2500000, // R$ 25.000
  },
  {
    name: "crm",
    displayName: "CRM Comercial",
    description: "Gestão de clientes, pipeline de vendas, propostas e relatórios.",
    category: "crm",
    iconEmoji: "👥",
    iconColor: "#6366f1",
    stackDefault: ["nextjs", "prisma", "supabase", "tailwind"],
    featuresDefault: ["cadastro clientes", "pipeline", "propostas", "relatórios", "agenda"],
    estimatedHours: 80,
    estimatedPriceCents: 1800000, // R$ 18.000
  },
  {
    name: "dashboard",
    displayName: "Dashboard Analytics",
    description: "Painel de métricas com gráficos, KPIs e relatórios em tempo real.",
    category: "analytics",
    iconEmoji: "📊",
    iconColor: "#f59e0b",
    stackDefault: ["nextjs", "prisma", "supabase", "tailwind", "recharts"],
    featuresDefault: ["KPIs", "gráficos", "filtros", "export PDF", "multi-tenant"],
    estimatedHours: 60,
    estimatedPriceCents: 1500000, // R$ 15.000
  },
  {
    name: "blog",
    displayName: "Blog / Portal de Notícias",
    description: "Publicação de conteúdo com editor rich text, categorias e SEO.",
    category: "content",
    iconEmoji: "✍️",
    iconColor: "#8b5cf6",
    stackDefault: ["nextjs", "prisma", "supabase", "tailwind"],
    featuresDefault: ["editor", "categorias", "tags", "SEO", "comentários", "newsletter"],
    estimatedHours: 40,
    estimatedPriceCents: 800000, // R$ 8.000
  },
  {
    name: "saas",
    displayName: "Plataforma SaaS",
    description: "Aplicação multi-tenant com assinaturas, billing e isolamento de dados.",
    category: "saas",
    iconEmoji: "🚀",
    iconColor: "#ec4899",
    stackDefault: ["nextjs", "prisma", "supabase", "tailwind", "stripe"],
    featuresDefault: ["multi-tenant", "assinaturas", "billing", "RBAC", "API pública"],
    estimatedHours: 200,
    estimatedPriceCents: 4500000, // R$ 45.000
  },
  {
    name: "mobile-app",
    displayName: "App Mobile (PWA)",
    description: "Aplicativo mobile instalável com offline-first e push notifications.",
    category: "mobile",
    iconEmoji: "📱",
    iconColor: "#06b6d4",
    stackDefault: ["nextjs", "prisma", "supabase", "tailwind", "pwa"],
    featuresDefault: ["offline", "push", "geolocalização", "câmera", "auth"],
    estimatedHours: 100,
    estimatedPriceCents: 2200000, // R$ 22.000
  },
];

async function seedOfficialTemplatesAction() {
  try {
    const count = await prisma.projectTemplate.count({ where: { isOfficial: true } });
    if (count > 0) return; // Already seeded

    for (const t of OFFICIAL_TEMPLATES) {
      await prisma.projectTemplate.create({
        data: {
          name: t.name,
          displayName: t.displayName,
          description: t.description,
          category: t.category,
          iconEmoji: t.iconEmoji,
          iconColor: t.iconColor,
          stackDefault: t.stackDefault as any,
          featuresDefault: t.featuresDefault as any,
          estimatedHours: t.estimatedHours,
          estimatedPriceCents: t.estimatedPriceCents,
          isOfficial: true,
          isActive: true,
          companyId: null, // global template
        },
      });
    }
  } catch (e) {
    console.error("seedOfficialTemplates error:", e);
  }
}
