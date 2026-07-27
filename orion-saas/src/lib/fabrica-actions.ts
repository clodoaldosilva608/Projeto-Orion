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

// ================================================================
// BRIEFINGS — CRUD + IA generation
// ================================================================

export async function listBriefingsAction(filter?: {
  status?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const where: any = { companyId: user.companyId };
    if (filter?.status && filter.status !== "all") where.status = filter.status;

    const briefings = await prisma.projectBriefing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: { id: true, name: true, status: true, progress: true },
        },
      },
    });

    return {
      data: briefings.map((b) => ({
        id: b.id.toString(),
        clientName: b.clientName,
        clientCompany: b.clientCompany,
        clientEmail: b.clientEmail,
        clientPhone: b.clientPhone,
        projectType: b.projectType,
        problemStatement: b.problemStatement,
        keyFeatures: b.keyFeatures,
        budgetCents: b.budgetCents,
        timelineWeeks: b.timelineWeeks,
        status: b.status,
        aiGeneratedDoc: b.aiGeneratedDoc,
        aiArchitectureSuggestion: b.aiArchitectureSuggestion,
        aiStackSuggestion: b.aiStackSuggestion,
        aiEstimatedHours: b.aiEstimatedHours,
        aiEstimatedCostCents: b.aiEstimatedCostCents,
        reviewNotes: b.reviewNotes,
        createdAt: b.createdAt.toISOString(),
        reviewedAt: b.reviewedAt?.toISOString() ?? null,
        project: b.project
          ? {
              id: b.project.id.toString(),
              name: b.project.name,
              status: b.project.status,
              progress: b.project.progress,
            }
          : null,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function getBriefingAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const briefing = await prisma.projectBriefing.findFirst({
      where: { id: BigInt(id), companyId: user.companyId },
      include: {
        project: {
          select: {
            id: true, name: true, status: true, progress: true,
            stack: true, keyFeatures: true, estimatedEndDate: true,
          },
        },
      },
    });
    if (!briefing) return { data: null, error: "Briefing não encontrado" };

    return {
      data: {
        ...briefing,
        id: briefing.id.toString(),
        companyId: briefing.companyId.toString(),
        projectId: briefing.projectId?.toString() ?? null,
        keyFeatures: briefing.keyFeatures,
        aiStackSuggestion: briefing.aiStackSuggestion,
        reviewedAt: briefing.reviewedAt?.toISOString() ?? null,
        createdAt: briefing.createdAt.toISOString(),
        project: briefing.project
          ? {
              ...briefing.project,
              id: briefing.project.id.toString(),
              estimatedEndDate: briefing.project.estimatedEndDate?.toISOString() ?? null,
            }
          : null,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function createBriefingAction(data: {
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone?: string;
  projectType?: string;
  problemStatement: string;
  targetAudience?: string;
  keyFeatures: string[];
  successCriteria?: string;
  budgetCents?: number;
  timelineWeeks?: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    if (!data.clientName?.trim() || !data.clientEmail?.trim() || !data.problemStatement?.trim()) {
      return { data: null, error: "Nome do cliente, e-mail e declaração do problema são obrigatórios" };
    }

    const briefing = await prisma.projectBriefing.create({
      data: {
        companyId: user.companyId,
        clientName: data.clientName.trim(),
        clientCompany: data.clientCompany?.trim() || null,
        clientEmail: data.clientEmail.trim(),
        clientPhone: data.clientPhone?.trim() || null,
        projectType: data.projectType?.trim() || null,
        problemStatement: data.problemStatement.trim(),
        targetAudience: data.targetAudience?.trim() || null,
        keyFeatures: (data.keyFeatures ?? []) as any,
        successCriteria: data.successCriteria?.trim() || null,
        budgetCents: data.budgetCents ?? null,
        timelineWeeks: data.timelineWeeks ?? null,
        status: "draft",
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "project_briefings",
      recordId: briefing.id,
      newValue: { clientName: briefing.clientName, projectType: briefing.projectType },
    });

    revalidatePath("/fabrica/briefings");
    return { data: { id: briefing.id.toString() }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// IA — generateIaBriefingAction
// ================================================================

const IA_SYSTEM_PROMPT = `Você é o arquiteto de software sênior da plataforma Orion, uma Plataforma Inteligente de Desenvolvimento de Software.

Sua tarefa: receber um briefing de projeto do cliente e gerar:

1. **PRD (Product Requirements Document)** em Markdown — incluindo:
   - Visão geral do produto
   - Problema que resolve
   - Público-alvo
   - User stories (pelo menos 5)
   - Critérios de aceite
   - Requisitos não funcionais (segurança, performance, escalabilidade)
   - Escopo da MVP vs fases futuras

2. **Sugestão de Arquitetura** em Markdown — incluindo:
   - Stack tecnológica recomendada (justificada)
   - Estrutura de pastas
   - Modelo de dados principal (entidades e relacionamentos)
   - Integrações necessárias
   - Considerações de deploy

3. **Estimativas** (formato JSON no final, entre marcadores <estimativas>...</estimativas>):
   - estimatedHours: número total de horas estimadas
   - estimatedCostCents: custo em centavos de Real (R$ 1.000 = 100000)
   - stackSuggestion: array de strings com tecnologias recomendadas

Use português brasileiro. Seja específico e prático. Foque em tecnologias modernas: Next.js 14+, React 19, TypeScript, Prisma, PostgreSQL/Supabase, Tailwind, Stripe para pagamentos.

Formato de resposta:
## PRD
[conteúdo em markdown]

## Arquitetura
[conteúdo em markdown]

<estimativas>
{"estimatedHours": 120, "estimatedCostCents": 2500000, "stackSuggestion": ["nextjs", "prisma", "supabase", "tailwind", "stripe"]}
</estimativas>`;

export async function generateIaBriefingAction(briefingId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const briefing = await prisma.projectBriefing.findFirst({
      where: { id: BigInt(briefingId), companyId: user.companyId },
    });
    if (!briefing) return { data: null, error: "Briefing não encontrado" };

    // Update status to ai_processing
    await prisma.projectBriefing.update({
      where: { id: briefing.id },
      data: { status: "ai_processing" },
    });
    revalidatePath(`/fabrica/briefings/${briefingId}`);

    // Build the user message from briefing data
    const features = (briefing.keyFeatures as string[]) ?? [];
    const userMessage = `# Briefing do Projeto

**Cliente:** ${briefing.clientName}
${briefing.clientCompany ? `**Empresa:** ${briefing.clientCompany}` : ""}
${briefing.projectType ? `**Tipo de projeto:** ${briefing.projectType}` : ""}

## Problema a resolver
${briefing.problemStatement}

${briefing.targetAudience ? `## Público-alvo\n${briefing.targetAudience}` : ""}

## Funcionalidades-chave solicitadas
${features.length > 0 ? features.map((f, i) => `${i + 1}. ${f}`).join("\n") : "(cliente não especificou)"}

${briefing.successCriteria ? `## Critérios de sucesso\n${briefing.successCriteria}` : ""}

${briefing.budgetCents ? `## Orçamento: R$ ${(briefing.budgetCents / 100).toLocaleString("pt-BR")}` : ""}

${briefing.timelineWeeks ? `## Prazo desejado: ${briefing.timelineWeeks} semanas` : ""}

---

Com base nesse briefing, gere o PRD, a sugestão de arquitetura e as estimativas conforme as instruções.`;

    // Call IA
    const { askAI } = await import("./ai");
    const result = await askAI(IA_SYSTEM_PROMPT, userMessage);

    let aiGeneratedDoc = result.text;
    let aiArchitectureSuggestion: string | null = null;
    let aiStackSuggestion: any[] = [];
    let aiEstimatedHours: number | null = null;
    let aiEstimatedCostCents: number | null = null;

    // If IA fallback was used, generate a template-based PRD instead
    if (result.usedFallback) {
      const templateResult = generateTemplateBriefing(briefing, features);
      aiGeneratedDoc = templateResult.prd;
      aiArchitectureSuggestion = templateResult.architecture;
      aiStackSuggestion = templateResult.stack;
      aiEstimatedHours = templateResult.estimatedHours;
      aiEstimatedCostCents = templateResult.estimatedCostCents;
    } else {
      // Extract estimativas JSON from response
      const estimativasMatch = result.text.match(/<estimativas>([\s\S]*?)<\/estimativas>/);
      if (estimativasMatch) {
        try {
          const est = JSON.parse(estimativasMatch[1].trim());
          aiEstimatedHours = est.estimatedHours ?? null;
          aiEstimatedCostCents = est.estimatedCostCents ?? null;
          aiStackSuggestion = est.stackSuggestion ?? [];
          // Remove the estimativas block from the doc
          aiGeneratedDoc = aiGeneratedDoc.replace(/<estimativas>[\s\S]*?<\/estimativas>/, "").trim();
        } catch {}
      }

      // Split PRD from Architecture
      const archMatch = aiGeneratedDoc.match(/##\s+Arquitetura\s*\n([\s\S]*?)(?=\n##\s+|$)/i);
      if (archMatch) {
        aiArchitectureSuggestion = `## Arquitetura\n${archMatch[1].trim()}`;
        aiGeneratedDoc = aiGeneratedDoc.replace(/##\s+Arquitetura\s*\n[\s\S]*?(?=\n##\s+|$)/i, "").trim();
      }
    }

    // Update briefing with IA-generated content
    await prisma.projectBriefing.update({
      where: { id: briefing.id },
      data: {
        aiGeneratedDoc,
        aiArchitectureSuggestion,
        aiStackSuggestion: aiStackSuggestion as any,
        aiEstimatedHours,
        aiEstimatedCostCents,
        status: "reviewed",
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "update",
      tableName: "project_briefings",
      recordId: briefing.id,
      newValue: {
        status: "reviewed",
        iaGenerated: !result.usedFallback,
        estimatedHours: aiEstimatedHours,
        estimatedCostCents: aiEstimatedCostCents,
      },
    });

    revalidatePath(`/fabrica/briefings/${briefingId}`);
    revalidatePath("/fabrica/briefings");

    return {
      data: {
        ok: true,
        usedFallback: result.usedFallback,
        estimatedHours: aiEstimatedHours,
        estimatedCostCents: aiEstimatedCostCents,
        stackSuggestion: aiStackSuggestion,
      },
      error: null,
    };
  } catch (e) {
    console.error("generateIaBriefingAction error:", e);
    // Reset status on error
    try {
      await prisma.projectBriefing.update({
        where: { id: BigInt(briefingId) },
        data: { status: "draft" },
      });
    } catch {}
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// BRIEFING — approve (convert to project) + reject
// ================================================================

export async function approveBriefingAction(briefingId: string, data: {
  projectName: string;
  templateId?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const briefing = await prisma.projectBriefing.findFirst({
      where: { id: BigInt(briefingId), companyId: user.companyId },
    });
    if (!briefing) return { data: null, error: "Briefing não encontrado" };

    // Calculate estimated end date
    let estimatedEndDate: Date | null = null;
    if (briefing.timelineWeeks) {
      estimatedEndDate = new Date();
      estimatedEndDate.setDate(estimatedEndDate.getDate() + briefing.timelineWeeks * 7);
    } else if (briefing.aiEstimatedHours) {
      // ~40h/week = ~5h/day, so estimated_weeks = hours / 40
      const weeks = Math.ceil(briefing.aiEstimatedHours / 40);
      estimatedEndDate = new Date();
      estimatedEndDate.setDate(estimatedEndDate.getDate() + weeks * 7);
    }

    // Create the SoftwareProject linked to this briefing
    const project = await prisma.softwareProject.create({
      data: {
        companyId: user.companyId,
        templateId: data.templateId ? BigInt(data.templateId) : null,
        name: data.projectName.trim(),
        description: briefing.problemStatement,
        status: "briefing", // start at briefing stage
        stack: (briefing.aiStackSuggestion ?? []) as any,
        keyFeatures: briefing.keyFeatures as any,
        successCriteria: briefing.successCriteria,
        budgetCents: briefing.aiEstimatedCostCents ?? briefing.budgetCents,
        startDate: new Date(),
        estimatedEndDate,
        createdBy: user.id,
        briefing: {
          connect: { id: briefing.id },
        },
      },
    });

    // Update briefing status
    await prisma.projectBriefing.update({
      where: { id: briefing.id },
      data: {
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    });

    // Create default pipeline stages
    const defaultStages = [
      { name: "Briefing", sortOrder: 0, status: "completed", completedAt: new Date() },
      { name: "Arquitetura", sortOrder: 1, status: "active" },
      { name: "Desenvolvimento", sortOrder: 2, status: "pending" },
      { name: "Testes", sortOrder: 3, status: "pending" },
      { name: "Deploy", sortOrder: 4, status: "pending" },
      { name: "Entrega", sortOrder: 5, status: "pending" },
    ];
    for (const stage of defaultStages) {
      await prisma.projectStage.create({
        data: {
          projectId: project.id,
          name: stage.name,
          sortOrder: stage.sortOrder,
          status: stage.status as any,
          completedAt: stage.completedAt ?? null,
        },
      });
    }

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "software_projects",
      recordId: project.id,
      newValue: { name: project.name, fromBriefing: briefing.id.toString() },
    });

    revalidatePath("/fabrica/briefings");
    revalidatePath("/fabrica/projetos");
    revalidatePath(`/fabrica/briefings/${briefingId}`);
    return { data: { projectId: project.id.toString() }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function rejectBriefingAction(briefingId: string, notes: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.projectBriefing.update({
      where: { id: BigInt(briefingId) },
      data: {
        status: "rejected",
        reviewNotes: notes,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    });

    revalidatePath("/fabrica/briefings");
    revalidatePath(`/fabrica/briefings/${briefingId}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteBriefingAction(briefingId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.projectBriefing.delete({
      where: { id: BigInt(briefingId) },
    });

    revalidatePath("/fabrica/briefings");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// TEMPLATE-BASED FALLBACK — used when OPENAI_API_KEY is not configured
// Generates a structured PRD + architecture + estimativas from the briefing
// data using rule-based logic (no IA call).
// ================================================================

function generateTemplateBriefing(briefing: any, features: string[]): {
  prd: string;
  architecture: string;
  stack: string[];
  estimatedHours: number;
  estimatedCostCents: number;
} {
  const projectType = briefing.projectType || "aplicação web";
  const featuresList = features.length > 0
    ? features.map((f, i) => `${i + 1}. ${f}`).join("\n")
    : "(cliente não especificou funcionalidades)";

  // Default stack
  const stack = ["nextjs", "react", "typescript", "prisma", "supabase", "tailwind"];
  if (features.some((f) => f.toLowerCase().includes("pagamento") || f.toLowerCase().includes("stripe"))) {
    stack.push("stripe");
  }
  if (features.some((f) => f.toLowerCase().includes("notifica") || f.toLowerCase().includes("push"))) {
    stack.push("nodemailer");
  }

  // Estimate hours based on features count and project type
  const baseHours: Record<string, number> = {
    "e-commerce": 120,
    "crm": 80,
    "dashboard": 60,
    "blog": 40,
    "saas": 200,
    "mobile": 100,
    "marketplace": 150,
    "landing-page": 20,
    "erp": 180,
  };
  let estimatedHours = baseHours[briefing.projectType] ?? 80;
  estimatedHours += features.length * 8; // +8h per feature
  if (features.some((f) => f.toLowerCase().includes("multi-tenant"))) estimatedHours += 40;
  if (features.some((f) => f.toLowerCase().includes("api pública"))) estimatedHours += 30;

  // Cost: R$ 150/hora
  const estimatedCostCents = estimatedHours * 150 * 100;

  const prd = `# PRD — ${briefing.clientName}

> ⚠️ **Nota:** Este PRD foi gerado automaticamente pela plataforma Orion
> em modo fallback (sem OPENAI_API_KEY configurada). Para gerar PRDs
> personalizados com IA, configure a variável OPENAI_API_KEY no Vercel.

## 1. Visão Geral do Produto

**Cliente:** ${briefing.clientName}
${briefing.clientCompany ? `**Empresa:** ${briefing.clientCompany}` : ""}
**Tipo de projeto:** ${projectType}

Este projeto visa desenvolver uma ${projectType} para ${briefing.clientName}.
${briefing.clientCompany ? `A empresa ${briefing.clientCompany} ` : "O cliente "}precisa de uma solução
que resolva o problema descrito abaixo.

## 2. Problema que Resolve

${briefing.problemStatement}

## 3. Público-alvo

${briefing.targetAudience || "Público-alvo a ser definido em conjunto com o cliente durante a fase de arquitetura."}

## 4. Funcionalidades-chave

${featuresList}

## 5. User Stories (MVP)

### US-01: Autenticação
**Como** usuário
**Quero** fazer login no sistema
**Para** acessar minhas informações privadas

**Critérios de aceite:**
- Login com e-mail e senha
- Recuperação de senha por e-mail
- Sessão persistente (7 dias)

### US-02: Painel Administrativo
**Como** administrador
**Quero** acessar um painel de controle
**Para** gerenciar os dados do sistema

**Critérios de aceite:**
- Dashboard com KPIs principais
- CRUD de entidades principais
- Filtros e busca

### US-03: ${features[0] || "Funcionalidade principal"}
**Como** usuário
**Quero** ${features[0]?.toLowerCase() || "usar a funcionalidade principal"}
**Para** atingir meu objetivo

**Critérios de aceite:**
- Interface intuitiva
- Validação de dados
- Feedback visual

${features.slice(1, 4).map((f, i) => `### US-${String(i + 4).padStart(2, "0")}: ${f}
**Como** usuário
**Quero** ${f.toLowerCase()}
**Para** melhorar minha experiência

**Critérios de aceite:**
- Implementação completa
- Testes automatizados
- Documentação`).join("\n\n")}

## 6. Requisitos Não Funcionais

### Segurança
- Autenticação obrigatória (exceto landing page)
- Criptografia SSL em todas as camadas
- Validação de input em todos os endpoints
- Rate limiting em endpoints sensíveis

### Performance
- Tempo de carregamento inicial < 2s
- API p95 < 500ms
- Cache de consultas frequentes

### Escalabilidade
- Arquitetura multi-tenant (se aplicável)
- Banco de dados com índices otimizados
- CDN para assets estáticos

### LGPD
- Consentimento de cookies
- Política de privacidade
- Direito de acesso e exclusão de dados

## 7. Escopo da MVP vs Fases Futuras

### MVP (8 semanas)
${features.slice(0, 5).map((f, i) => `- ${f}`).join("\n") || "- Funcionalidades principais"}

### Fase 2 (semanas 9-14)
${features.slice(5).map((f) => `- ${f}`).join("\n") || "- Features avançadas"}
- Relatórios e analytics
- Integrações externas

### Fase 3 (futuro)
- App mobile
- Marketplace de plugins
- IA e automações

## 8. Critérios de Sucesso

${briefing.successCriteria || "Critérios de sucesso a serem definidos em conjunto com o cliente."}

## 9. Estimativas

- **Horas estimadas:** ${estimatedHours}h
- **Custo estimado:** R$ ${(estimatedCostCents / 100).toLocaleString("pt-BR")}
- **Prazo estimado:** ${Math.ceil(estimatedHours / 40)} semanas (considerando 40h/semana)

---

*Gerado automaticamente pela Plataforma Orion em ${new Date().toLocaleString("pt-BR")}*`;

  const architecture = `## Arquitetura Técnica

### Stack Tecnológica Recomendada

${stack.map((s) => `- **${s}**`).join("\n")}

### Estrutura de Pastas

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Layout de autenticação
│   ├── (dashboard)/       # Layout autenticado
│   ├── api/               # API Routes
│   └── layout.tsx
├── components/            # Componentes React reutilizáveis
├── lib/                   # Setup de libs (prisma, supabase, etc)
├── modules/               # Módulos de domínio
└── types/                 # Tipos TypeScript
\`\`\`

### Modelo de Dados Principal

\`\`\`
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  role        Role     @default(USER)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Company {
  id          String   @id @default(cuid())
  name        String
  cnpj        String?  @unique
  users       User[]
  createdAt   DateTime @default(now())
}
\`\`\`

### Integrações Necessárias

${features.some((f) => f.toLowerCase().includes("pagamento")) ? "- **Stripe** — processamento de pagamentos" : "- **Supabase Auth** — autenticação"}
${features.some((f) => f.toLowerCase().includes("email")) ? "- **Nodemailer + SMTP** — envio de e-mails" : "- **Supabase** — banco de dados PostgreSQL"}
- **Vercel** — deploy e hospedagem

### Considerações de Deploy

- Deploy automático via Vercel (git push → production)
- Variáveis de ambiente no Vercel Dashboard
- Banco de dados: Supabase (PostgreSQL gerenciado)
- CDN: Vercel Edge Network (automático)
- Monitoramento: Vercel Analytics + logs

---

*Gerado automaticamente pela Plataforma Orion*`;

  return {
    prd,
    architecture,
    stack,
    estimatedHours,
    estimatedCostCents,
  };
}

// ================================================================
// P16 — PIPELINE DE DESENVOLVIMENTO VISUAL (Kanban)
// ================================================================

export async function getProjectAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const project = await prisma.softwareProject.findFirst({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      include: {
        briefing: {
          select: {
            clientName: true, clientCompany: true, clientEmail: true,
            problemStatement: true, keyFeatures: true,
            aiGeneratedDoc: true, aiArchitectureSuggestion: true,
            aiStackSuggestion: true, aiEstimatedHours: true, aiEstimatedCostCents: true,
          },
        },
        template: {
          select: { displayName: true, iconEmoji: true, iconColor: true },
        },
        stages: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!project) return { data: null, error: "Projeto não encontrado" };

    // Get team member details
    const teamIds = (project.team as any[])?.map((t: any) => BigInt(t.userId)) ?? [];
    let teamMembers: any[] = [];
    if (teamIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, name: true, email: true, jobTitle: true, avatarUrl: true },
      });
      teamMembers = users.map((u) => ({ ...u, id: u.id.toString() }));
    }

    return {
      data: {
        ...project,
        id: project.id.toString(),
        companyId: project.companyId.toString(),
        templateId: project.templateId?.toString() ?? null,
        stack: project.stack,
        timeline: project.timeline,
        team: project.team,
        keyFeatures: project.keyFeatures,
        startDate: project.startDate?.toISOString() ?? null,
        estimatedEndDate: project.estimatedEndDate?.toISOString() ?? null,
        deliveredAt: project.deliveredAt?.toISOString() ?? null,
        createdAt: project.createdAt.toISOString(),
        briefing: project.briefing
          ? {
              ...project.briefing,
              keyFeatures: project.briefing.keyFeatures,
              aiStackSuggestion: project.briefing.aiStackSuggestion,
            }
          : null,
        template: project.template,
        stages: project.stages.map((s) => ({
          ...s,
          id: s.id.toString(),
          projectId: s.projectId.toString(),
          assignedTo: s.assignedTo,
          deliverables: s.deliverables,
          startDate: s.startDate?.toISOString() ?? null,
          endDate: s.endDate?.toISOString() ?? null,
          completedAt: s.completedAt?.toISOString() ?? null,
        })),
        teamMembers,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function updateStageStatusAction(stageId: string, status: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const stage = await prisma.projectStage.findUnique({
      where: { id: BigInt(stageId) },
      include: { project: { select: { companyId: true, id: true } } },
    });
    if (!stage || stage.project.companyId !== user.companyId) {
      return { data: null, error: "Estágio não encontrado" };
    }

    const updateData: any = { status };
    if (status === "active" && !stage.startDate) {
      updateData.startDate = new Date();
    }
    if (status === "completed") {
      updateData.completedAt = new Date();
      updateData.endDate = new Date();
    }

    await prisma.projectStage.update({
      where: { id: BigInt(stageId) },
      data: updateData,
    });

    // Recalculate project progress
    await recalculateProjectProgress(stage.project.id);

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "update",
      tableName: "project_stages",
      recordId: BigInt(stageId),
      newValue: { status, stageName: stage.name },
    });

    revalidatePath(`/fabrica/projetos/${stage.project.id}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function assignStageTeamAction(stageId: string, userIds: string[]) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const stage = await prisma.projectStage.findUnique({
      where: { id: BigInt(stageId) },
      include: { project: { select: { companyId: true, id: true } } },
    });
    if (!stage || stage.project.companyId !== user.companyId) {
      return { data: null, error: "Estágio não encontrado" };
    }

    await prisma.projectStage.update({
      where: { id: BigInt(stageId) },
      data: { assignedTo: userIds as any },
    });

    revalidatePath(`/fabrica/projetos/${stage.project.id}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function addStageDeliverableAction(stageId: string, name: string, url?: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const stage = await prisma.projectStage.findUnique({
      where: { id: BigInt(stageId) },
      include: { project: { select: { companyId: true, id: true } } },
    });
    if (!stage || stage.project.companyId !== user.companyId) {
      return { data: null, error: "Estágio não encontrado" };
    }

    const deliverables = (stage.deliverables as any[]) ?? [];
    deliverables.push({
      name: name.trim(),
      url: url?.trim() || null,
      completedAt: null,
      addedAt: new Date().toISOString(),
    });

    await prisma.projectStage.update({
      where: { id: BigInt(stageId) },
      data: { deliverables: deliverables as any },
    });

    revalidatePath(`/fabrica/projetos/${stage.project.id}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function toggleDeliverableAction(stageId: string, index: number) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const stage = await prisma.projectStage.findUnique({
      where: { id: BigInt(stageId) },
      include: { project: { select: { companyId: true, id: true } } },
    });
    if (!stage || stage.project.companyId !== user.companyId) {
      return { data: null, error: "Estágio não encontrado" };
    }

    const deliverables = (stage.deliverables as any[]) ?? [];
    if (index < 0 || index >= deliverables.length) {
      return { data: null, error: "Deliverable não encontrado" };
    }
    deliverables[index].completedAt = deliverables[index].completedAt ? null : new Date().toISOString();

    await prisma.projectStage.update({
      where: { id: BigInt(stageId) },
      data: { deliverables: deliverables as any },
    });

    revalidatePath(`/fabrica/projetos/${stage.project.id}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function removeDeliverableAction(stageId: string, index: number) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const stage = await prisma.projectStage.findUnique({
      where: { id: BigInt(stageId) },
      include: { project: { select: { companyId: true, id: true } } },
    });
    if (!stage || stage.project.companyId !== user.companyId) {
      return { data: null, error: "Estágio não encontrado" };
    }

    const deliverables = (stage.deliverables as any[]) ?? [];
    if (index < 0 || index >= deliverables.length) {
      return { data: null, error: "Deliverable não encontrado" };
    }
    deliverables.splice(index, 1);

    await prisma.projectStage.update({
      where: { id: BigInt(stageId) },
      data: { deliverables: deliverables as any },
    });

    revalidatePath(`/fabrica/projetos/${stage.project.id}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function updateStageNotesAction(stageId: string, notes: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const stage = await prisma.projectStage.findUnique({
      where: { id: BigInt(stageId) },
      include: { project: { select: { companyId: true, id: true } } },
    });
    if (!stage || stage.project.companyId !== user.companyId) {
      return { data: null, error: "Estágio não encontrado" };
    }

    await prisma.projectStage.update({
      where: { id: BigInt(stageId) },
      data: { notes: notes.trim() || null },
    });

    revalidatePath(`/fabrica/projetos/${stage.project.id}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// Recalculate project progress based on completed stages
async function recalculateProjectProgress(projectId: bigint) {
  const stages = await prisma.projectStage.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
  });
  if (stages.length === 0) return;

  const completed = stages.filter((s) => s.status === "completed").length;
  const progress = Math.round((completed / stages.length) * 100);

  // Update project progress
  const updateData: any = { progress };
  // If all stages completed, mark project as delivered
  if (completed === stages.length) {
    updateData.status = "delivered";
    updateData.deliveredAt = new Date();
  } else {
    // Set status based on current active stage
    const activeStage = stages.find((s) => s.status === "active");
    if (activeStage) {
      const statusMap: Record<string, string> = {
        "Briefing": "briefing",
        "Arquitetura": "architecting",
        "Desenvolvimento": "developing",
        "Testes": "testing",
        "Deploy": "deploying",
        "Entrega": "delivered",
      };
      const newStatus = statusMap[activeStage.name];
      if (newStatus) updateData.status = newStatus;
    }
  }

  await prisma.softwareProject.update({
    where: { id: projectId },
    data: updateData,
  });
}

export async function listCompanyUsersForTeamAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const users = await prisma.user.findMany({
      where: { companyId: user.companyId, active: true, deletedAt: null },
      select: { id: true, name: true, email: true, jobTitle: true, avatarUrl: true },
      orderBy: { name: "asc" },
    });
    return {
      data: users.map((u) => ({ ...u, id: u.id.toString() })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
