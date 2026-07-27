/**
 * Calendário helpers — non-action utilities (sync functions allowed).
 *
 * Separated from calendario-actions.ts because Next.js requires all
 * exports from a "use server" file to be async functions.
 */

const HOLIDAY_COLORS: Record<string, string> = {
  holiday: "#ef4444",
  commemorative: "#f59e0b",
  campaign_deadline: "#8b5cf6",
  company_event: "#10b981",
  meeting: "#3b82f6",
  training: "#06b6d4",
  other: "#6b7280",
};

export function getEventColor(type: string): string {
  return HOLIDAY_COLORS[type] ?? "#6b7280";
}

export const CALENDAR_TYPE_LABELS: Record<string, string> = {
  holiday: "Feriado",
  commemorative: "Comemorativa",
  campaign_deadline: "Prazo de Campanha",
  company_event: "Evento Empresa",
  meeting: "Reunião",
  training: "Treinamento",
  other: "Outro",
};

export const CALENDAR_SCOPE_LABELS: Record<string, string> = {
  company: "Empresa",
  branch: "Filial",
  team: "Equipe",
  personal: "Pessoal",
};

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ================================================================
// BRAZILIAN NATIONAL HOLIDAYS + COMMEMORATIVE DATES (2026)
// ================================================================

export const BRAZILIAN_HOLIDAYS_2026 = [
  { date: "2026-01-01", title: "Confraternização Universal", type: "holiday" as const },
  { date: "2026-02-16", title: "Carnaval", type: "holiday" as const },
  { date: "2026-02-17", title: "Carnaval", type: "holiday" as const },
  { date: "2026-04-03", title: "Sexta-feira Santa", type: "holiday" as const },
  { date: "2026-04-05", title: "Páscoa", type: "commemorative" as const },
  { date: "2026-04-21", title: "Tiradentes", type: "holiday" as const },
  { date: "2026-05-01", title: "Dia do Trabalho", type: "holiday" as const },
  { date: "2026-06-04", title: "Corpus Christi", type: "holiday" as const },
  { date: "2026-09-07", title: "Independência do Brasil", type: "holiday" as const },
  { date: "2026-10-12", title: "Nossa Senhora Aparecida", type: "holiday" as const },
  { date: "2026-11-02", title: "Finados", type: "holiday" as const },
  { date: "2026-11-15", title: "Proclamação da República", type: "holiday" as const },
  { date: "2026-12-25", title: "Natal", type: "holiday" as const },
];

export const BRAZILIAN_COMMEMORATIVE_2026 = [
  { date: "2026-02-14", title: "Dia dos Namorados (antecipado)", type: "commemorative" as const },
  { date: "2026-03-08", title: "Dia Internacional da Mulher", type: "commemorative" as const },
  { date: "2026-04-19", title: "Dia dos Povos Indígenas", type: "commemorative" as const },
  { date: "2026-05-10", title: "Dia das Mães", type: "commemorative" as const },
  { date: "2026-06-12", title: "Dia dos Namorados", type: "commemorative" as const },
  { date: "2026-06-15", title: "Dia Global de Conscientização da Violência contra a Mulher", type: "commemorative" as const },
  { date: "2026-08-09", title: "Dia dos Pais", type: "commemorative" as const },
  { date: "2026-08-11", title: "Dia do Estudante", type: "commemorative" as const },
  { date: "2026-09-21", title: "Dia da Árvore", type: "commemorative" as const },
  { date: "2026-10-15", title: "Dia do Professor", type: "commemorative" as const },
  { date: "2026-10-19", title: "Dia do Vendedor", type: "commemorative" as const },
  { date: "2026-11-25", title: "Dia Internacional da Eliminação da Violência contra a Mulher", type: "commemorative" as const },
  { date: "2026-12-24", title: "Véspera de Natal", type: "commemorative" as const },
  { date: "2026-12-31", title: "Véspera de Ano-Novo", type: "commemorative" as const },
];
