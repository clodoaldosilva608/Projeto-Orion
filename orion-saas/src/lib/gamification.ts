/**
 * P8 — Gamificação Avançada
 *
 * Constants & helpers implementing rules RN-159 to RN-166 from
 * docs/07_Business_Rules_Document.md Capítulo 38.
 *
 * - RN-159: Pontos por Ação (configurable per company)
 * - RN-160: Níveis (fixed: Iniciante → Lenda)
 * - RN-161: Medalhas (fixed: ouro/prata/bronze/troféu)
 * - RN-162: Conquistas (achievements — unlockable, configurable)
 * - RN-163: Privacidade de Conquistas (default privado)
 * - RN-164: Ranking de Pontos (configurable per company)
 * - RN-165: Troca de Pontos (configurable catalog)
 * - RN-166: Reset de Pontos (no expiry, monthly ranking uses only month's pts)
 */

// ================================================================
// RN-160 — NÍVEIS (fixed)
// ================================================================

export type Level = {
  key: string;
  name: string;
  minPoints: number;
  color: string; // tailwind-friendly hex
  icon: string; // emoji
};

export const LEVELS: Level[] = [
  { key: "iniciante", name: "Iniciante", minPoints: 0, color: "#94a3b8", icon: "🌱" },
  { key: "bronze", name: "Bronze", minPoints: 1_000, color: "#cd7f32", icon: "🥉" },
  { key: "prata", name: "Prata", minPoints: 5_000, color: "#c0c0c0", icon: "🥈" },
  { key: "ouro", name: "Ouro", minPoints: 15_000, color: "#ffd700", icon: "🥇" },
  { key: "platina", name: "Platina", minPoints: 40_000, color: "#7fffd4", icon: "💎" },
  { key: "diamante", name: "Diamante", minPoints: 100_000, color: "#b9f2ff", icon: "💠" },
  { key: "lenda", name: "Lenda", minPoints: 250_000, color: "#ff00ff", icon: "👑" },
];

export function getLevelForPoints(points: number): Level {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.minPoints) current = lvl;
  }
  return current;
}

export function getNextLevel(points: number): Level | null {
  for (const lvl of LEVELS) {
    if (points < lvl.minPoints) return lvl;
  }
  return null; // already at max level
}

export function getLevelProgress(points: number): {
  current: Level;
  next: Level | null;
  progressPct: number;
  pointsToNext: number;
} {
  const current = getLevelForPoints(points);
  const next = getNextLevel(points);
  if (!next) return { current, next: null, progressPct: 100, pointsToNext: 0 };
  const range = next.minPoints - current.minPoints;
  const gained = points - current.minPoints;
  return {
    current,
    next,
    progressPct: Math.min(100, Math.round((gained / range) * 100)),
    pointsToNext: next.minPoints - points,
  };
}

// ================================================================
// RN-159 — PONTOS POR AÇÃO (default values, configurable per company)
// ================================================================

export type PointRule = {
  key: string;
  label: string;
  points: number;
  description: string;
};

export const DEFAULT_POINT_RULES: PointRule[] = [
  { key: "result_on_time", label: "Lançar resultado no horário (até 18h)", points: 10, description: "Lançamento pontual do resultado" },
  { key: "result_late", label: "Lançar resultado (após 18h)", points: 5, description: "Lançamento atrasado" },
  { key: "goal_daily_beat", label: "Bater meta diária", points: 50, description: "Meta diária atingida" },
  { key: "goal_weekly_beat", label: "Bater meta semanal", points: 200, description: "Meta semanal atingida" },
  { key: "goal_monthly_beat", label: "Bater meta mensal", points: 1_000, description: "Meta mensal atingida" },
  { key: "ranking_up", label: "Subir 1 posição no ranking", points: 20, description: "Promoção no ranking" },
  { key: "campaign_join", label: "Participar de campanha", points: 100, description: "Inscrição em campanha" },
  { key: "campaign_win", label: "Ganhar campanha (1º)", points: 500, description: "Primeiro lugar em campanha" },
  { key: "streak_7", label: "Streak 7 dias lançando", points: 100, description: "Sequência de 7 dias" },
  { key: "streak_30", label: "Streak 30 dias lançando", points: 500, description: "Sequência de 30 dias" },
  { key: "streak_90", label: "Streak 90 dias lançando", points: 2_000, description: "Sequência de 90 dias" },
  { key: "ai_feedback_positive", label: "Avaliar positiva IA (insight útil)", points: 5, description: "Feedback positivo em insight IA" },
];

// ================================================================
// RN-161 — MEDALHAS (fixed)
// ================================================================

export type Medal = {
  key: string;
  name: string;
  icon: string;
  description: string;
};

export const MEDALS: Medal[] = [
  { key: "gold", name: "Ouro", icon: "🥇", description: "1º lugar em campanha" },
  { key: "silver", name: "Prata", icon: "🥈", description: "2º lugar em campanha" },
  { key: "bronze", name: "Bronze", icon: "🥉", description: "3º lugar em campanha" },
  { key: "trophy", name: "Troféu", icon: "🏆", description: "Conquista especial (vendedor do mês, maior crescimento, etc.)" },
];

// ================================================================
// RN-162 — CONQUISTAS (achievements — unlockable)
// ================================================================

export type Achievement = {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "goal" | "campaign" | "result" | "client" | "special";
  // Optional threshold for automatic unlocking
  threshold?: { type: "count" | "streak" | "position"; value: number };
};

export const ACHIEVEMENTS: Achievement[] = [
  // Streak
  { key: "streak_7", name: "Constante", description: "Streak de 7 dias lançando resultados", icon: "🔥", category: "streak", threshold: { type: "streak", value: 7 } },
  { key: "streak_30", name: "Persistente", description: "Streak de 30 dias lançando resultados", icon: "🔥🔥", category: "streak", threshold: { type: "streak", value: 30 } },
  { key: "streak_90", name: "Imparável", description: "Streak de 90 dias lançando resultados", icon: "🔥🔥🔥", category: "streak", threshold: { type: "streak", value: 90 } },
  // Goal count
  { key: "goal_10", name: "Batedor de Metas", description: "Bateu meta 10 vezes", icon: "⭐", category: "goal", threshold: { type: "count", value: 10 } },
  { key: "goal_50", name: "Veterano", description: "Bateu meta 50 vezes", icon: "⭐⭐", category: "goal", threshold: { type: "count", value: 50 } },
  { key: "goal_100", name: "Lenda das Metas", description: "Bateu meta 100 vezes", icon: "⭐⭐⭐", category: "goal", threshold: { type: "count", value: 100 } },
  // Firsts
  { key: "first_goal", name: "Primeira Vitória", description: "Atingiu sua primeira meta", icon: "🎯", category: "goal", threshold: { type: "count", value: 1 } },
  { key: "first_campaign_win", name: "Campeão", description: "Primeira vitória em campanha", icon: "🏆", category: "campaign" },
  // Clients
  { key: "client_1", name: "Primeiro Cliente", description: "1º cliente fidelizado", icon: "💎", category: "client", threshold: { type: "count", value: 1 } },
  { key: "client_10", name: "Catalisador", description: "10 clientes fidelizados", icon: "💎💎", category: "client", threshold: { type: "count", value: 10 } },
  { key: "client_100", name: "Magnata", description: "100 clientes fidelizados", icon: "💎💎💎", category: "client", threshold: { type: "count", value: 100 } },
  // Special
  { key: "early_bird", name: "Madrugador", description: "Lançou resultado antes das 9h", icon: "🌅", category: "special" },
  { key: "ai_enthusiast", name: "Entusiasta IA", description: "Usou o assistente IA 10 vezes", icon: "🤖", category: "special", threshold: { type: "count", value: 10 } },
];

export function getAchievementByKey(key: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}

// ================================================================
// RN-165 — TROCA DE PONTOS (default catalog)
// ================================================================

export type Reward = {
  key: string;
  name: string;
  pointsCost: number;
  description: string;
  icon: string;
};

export const DEFAULT_REWARDS: Reward[] = [
  { key: "mug", name: "Caneca Orion", pointsCost: 500, description: "Caneca exclusiva Orion", icon: "☕" },
  { key: "tshirt", name: "Camiseta Orion", pointsCost: 1_000, description: "Camiseta oficial da plataforma", icon: "👕" },
  { key: "day_off", name: "1 Dia de Folga", pointsCost: 3_000, description: "Um dia de folga remunerado", icon: "🏖️" },
  { key: "gift_card_50", name: "Vale-Presente R$ 50", pointsCost: 5_000, description: "Vale-presente de R$ 50", icon: "🎁" },
  { key: "gift_card_200", name: "Vale-Presente R$ 200", pointsCost: 20_000, description: "Vale-presente de R$ 200", icon: "🎁" },
  { key: "bonus_500", name: "Bônus R$ 500", pointsCost: 50_000, description: "Bônus em dinheiro na próxima folha", icon: "💵" },
];
