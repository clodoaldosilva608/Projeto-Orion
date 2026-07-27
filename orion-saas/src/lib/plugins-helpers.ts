/**
 * Marketplace de Plugins — constants & helpers (non-action file).
 */

export const PLUGIN_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "integration", label: "Integrações", icon: "🔌" },
  { value: "communication", label: "Comunicação", icon: "💬" },
  { value: "crm", label: "CRM", icon: "👥" },
  { value: "inventory", label: "Estoque", icon: "📦" },
  { value: "commissions", label: "Comissões", icon: "💰" },
  { value: "analytics", label: "Analytics", icon: "📊" },
  { value: "automation", label: "Automação", icon: "⚡" },
  { value: "other", label: "Outros", icon: "🧩" },
];

export function getCategoryLabel(value: string): string {
  return PLUGIN_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoryIcon(value: string): string {
  return PLUGIN_CATEGORIES.find((c) => c.value === value)?.icon ?? "🧩";
}

/**
 * 5 plugins oficiais — seed data per docs/16_Roadmap.md v2.0 Q2 2026:
 * 1. WhatsApp Business, 2. Telegram Bot, 3. CRM Básico,
 *    4. Estoque Básico, 5. Comissões
 */
export const OFFICIAL_PLUGINS = [
  {
    slug: "whatsapp-business",
    name: "whatsapp-business",
    displayName: "WhatsApp Business",
    description:
      "Notifica vendedores e clientes via WhatsApp. Envie mensagens automáticas quando metas são atingidas, campanhas iniciam, ou resultados são aprovados.",
    category: "communication" as const,
    iconEmoji: "💬",
    iconColor: "#25D366",
    author: "Orion Official",
    isOfficial: true,
    eventsSupported: ["result.approved", "campaign.started", "campaign.ended", "goal.completed"],
    defaultConfig: {
      apiUrl: "https://api.whatsapp.com/send",
      phoneNumberId: "",
      accessToken: "",
      template: "Olá {nome}, {mensagem}",
    },
    configSchema: {
      apiUrl: { type: "string", label: "API URL", required: true },
      phoneNumberId: { type: "string", label: "Phone Number ID", required: true },
      accessToken: { type: "password", label: "Access Token", required: true },
      template: { type: "text", label: "Template de mensagem", required: false },
    },
  },
  {
    slug: "telegram-bot",
    name: "telegram-bot",
    displayName: "Telegram Bot",
    description:
      "Envia o ranking diário e notificações no Telegram. Perfeito para manter a equipe comercial engajada em tempo real.",
    category: "communication" as const,
    iconEmoji: "✈️",
    iconColor: "#0088cc",
    author: "Orion Official",
    isOfficial: true,
    eventsSupported: ["ranking.daily", "campaign.started", "result.approved"],
    defaultConfig: {
      botToken: "",
      chatId: "",
      sendDailyRanking: true,
      rankingTime: "09:00",
    },
    configSchema: {
      botToken: { type: "password", label: "Bot Token", required: true },
      chatId: { type: "string", label: "Chat ID (grupo/canal)", required: true },
      sendDailyRanking: { type: "boolean", label: "Enviar ranking diário", required: false },
      rankingTime: { type: "string", label: "Horário do ranking (HH:MM)", required: false },
    },
  },
  {
    slug: "crm-basico",
    name: "crm-basico",
    displayName: "CRM Básico",
    description:
      "Pipeline de vendas integrado. Gerencie leads, oportunidades e clientes em um kanban simples conectado às metas e resultados.",
    category: "crm" as const,
    iconEmoji: "👥",
    iconColor: "#6366f1",
    author: "Orion Official",
    isOfficial: true,
    eventsSupported: ["client.created", "client.updated", "deal.won", "deal.lost"],
    defaultConfig: {
      pipelineStages: ["Lead", "Qualificado", "Proposta", "Negociação", "Fechado"],
      autoCreateClientOnResult: false,
    },
    configSchema: {
      pipelineStages: { type: "array", label: "Estágios do pipeline", required: false },
      autoCreateClientOnResult: { type: "boolean", label: "Criar cliente automaticamente ao lançar resultado", required: false },
    },
  },
  {
    slug: "estoque-basico",
    name: "estoque-basico",
    displayName: "Estoque Básico",
    description:
      "Sincroniza produtos e estoque com ERPs. Mantém o catálogo sempre atualizado e evita vender produtos sem estoque.",
    category: "inventory" as const,
    iconEmoji: "📦",
    iconColor: "#f59e0b",
    author: "Orion Official",
    isOfficial: true,
    eventsSupported: ["product.updated", "stock.low", "stock.out"],
    defaultConfig: {
      erpType: "totvs",
      syncInterval: "hourly",
      lowStockThreshold: 10,
    },
    configSchema: {
      erpType: { type: "select", label: "Tipo de ERP", options: ["totvs", "sap_b1", "sankhya", "bentry"], required: true },
      syncInterval: { type: "select", label: "Intervalo de sincronização", options: ["realtime", "hourly", "daily"], required: false },
      lowStockThreshold: { type: "number", label: "Limite de estoque baixo", required: false },
    },
  },
  {
    slug: "comissoes",
    name: "comissoes",
    displayName: "Comissões",
    description:
      "Cálculo automático de comissões por vendedor, meta e campanha. Gera relatórios mensais e integra com folha de pagamento.",
    category: "commissions" as const,
    iconEmoji: "💰",
    iconColor: "#10b981",
    author: "Orion Official",
    isOfficial: true,
    eventsSupported: ["result.approved", "campaign.ended", "commission.calculated"],
    defaultConfig: {
      defaultRate: 2.5,
      bonusOnGoalBeat: 1.0,
      payDay: 5,
    },
    configSchema: {
      defaultRate: { type: "number", label: "Taxa padrão (%)", required: true },
      bonusOnGoalBeat: { type: "number", label: "Bônus ao bater meta (%)", required: false },
      payDay: { type: "number", label: "Dia de pagamento (1-31)", required: false },
    },
  },
];
