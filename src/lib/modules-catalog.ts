/**
 * Available Modules catalog — Orion Platform
 *
 * Lista de módulos que podem ser habilitados para cada empresa (tenant).
 * Estes são apenas metadados estáticos — não são server actions.
 * Server actions estão em modules-actions.ts.
 */

export const AVAILABLE_MODULES = [
  {
    key: "paguemenos",
    name: "PagueMenos",
    description: "Plataforma de gestão comercial com IA — vendas, metas, ranking, campanhas",
    icon: "🛒",
    color: "#DC2626",
    deployUrl: "https://projeto-paguemenos.vercel.app",
  },
  {
    key: "fabrica",
    name: "Fábrica de Software",
    description: "Briefing IA + Pipeline Kanban + Licenciamento de produtos",
    icon: "🏭",
    color: "#8b5cf6",
    deployUrl: null, // interno
  },
  {
    key: "vendas",
    name: "Módulo de Vendas",
    description: "CRM comercial com pipeline e comissões",
    icon: "💼",
    color: "#3b82f6",
    deployUrl: null,
  },
  {
    key: "ia",
    name: "IA & Automação",
    description: "Geração de briefings, análises inteligentes e automações",
    icon: "🤖",
    color: "#10b981",
    deployUrl: null,
  },
  {
    key: "deploy",
    name: "Dev & Deploy",
    description: "Gerenciamento de deploys e ambientes",
    icon: "🚀",
    color: "#f59e0b",
    deployUrl: null,
  },
  {
    key: "calendario",
    name: "Calendário & Tarefas",
    description: "Agenda compartilhada, eventos e checklist",
    icon: "📅",
    color: "#ec4899",
    deployUrl: null,
  },
] as const;

export type ModuleKey = (typeof AVAILABLE_MODULES)[number]["key"];

export const MODULE_KEYS = AVAILABLE_MODULES.map((m) => m.key);
