import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Trophy, Sparkles, TrendingUp, Award, History, Crown } from "lucide-react";
import { getUserProfileAction, getGamificationCatalogAction } from "@/lib/gamification-actions";
import { ACHIEVEMENTS, DEFAULT_REWARDS } from "@/lib/gamification";
import { RedeemButton } from "./RedeemButton";

export const dynamic = "force-dynamic";

function formatPoints(n: number): string {
  return n.toLocaleString("pt-BR");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function GamificacaoPage() {
  const { data: profile, error } = await getUserProfileAction();
  const { data: catalog } = await getGamificationCatalogAction();

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="max-w-[1200px] mx-auto">
          <PageHeader title="Gamificação" description="Perfil de gamificação do usuário" icon={Trophy} />
          <div className="glass-card p-8 text-center text-sm text-red-300">
            {error ?? "Não foi possível carregar o perfil"}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const p: any = profile;
  const level = p.level;
  const progress = p.progress;
  const unlockedKeys = new Set(p.achievements.map((a: any) => a.achievementKey));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Gamificação"
          description="Ganhe pontos, suba de nível, desbloqueie conquistas e troque pontos por prêmios."
          icon={Trophy}
        />

        {/* Hero — level + points */}
        <div className="glass-card p-6 lg:p-8 relative overflow-hidden">
          <div
            className="absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: level.color }}
          />
          <div className="relative flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Level badge */}
            <div
              className="h-24 w-24 rounded-2xl flex items-center justify-center text-5xl shrink-0 shadow-lg"
              style={{ backgroundColor: `${level.color}22`, border: `2px solid ${level.color}55` }}
            >
              {level.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{p.user.name}</h2>
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${level.color}22`, color: level.color }}
                >
                  <Sparkles className="h-3 w-3" />
                  Nível {level.name}
                </span>
              </div>
              <p className="text-sm text-[#8b8fa3] mt-1">{p.user.jobTitle ?? p.user.email}</p>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[#8b8fa3] mb-1.5">
                  <span>{formatPoints(p.totalPoints)} pontos totais</span>
                  {progress.next ? (
                    <span>{progress.pointsToNext} pts → {progress.next.name}</span>
                  ) : (
                    <span className="text-amber-300">Nível máximo alcançado! 👑</span>
                  )}
                </div>
                <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress.progressPct}%`,
                      background: `linear-gradient(90deg, ${level.color}, ${progress.next?.color ?? level.color})`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:text-right">
              <div>
                <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Pontos no mês</div>
                <div className="text-2xl font-bold text-violet-300">{formatPoints(p.monthlyPoints)}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Conquistas</div>
                <div className="text-2xl font-bold text-amber-300">{p.achievementsCount}/{ACHIEVEMENTS.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Achievements */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-semibold text-white">Conquistas</h3>
                </div>
                <span className="text-xs text-[#6b7280]">{p.achievementsCount}/{ACHIEVEMENTS.length} desbloqueadas</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-5">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = unlockedKeys.has(a.key);
                  return (
                    <div
                      key={a.key}
                      className={`rounded-lg border p-3 transition-all ${
                        unlocked
                          ? "border-amber-500/30 bg-amber-500/[0.06]"
                          : "border-white/[0.04] bg-white/[0.02] opacity-60"
                      }`}
                    >
                      <div className={`text-2xl mb-1.5 ${!unlocked && "grayscale"}`}>{a.icon}</div>
                      <div className="text-xs font-semibold text-white">{a.name}</div>
                      <div className="text-[10px] text-[#8b8fa3] mt-0.5 line-clamp-2">{a.description}</div>
                      {unlocked && (
                        <div className="text-[10px] text-amber-300 mt-1.5 inline-flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> Desbloqueada
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent point transactions */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <History className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Histórico de pontos</h3>
              </div>
              {p.recentTransactions.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">
                  Nenhuma transação ainda. Comece lançando resultados!
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  {p.recentTransactions.map((t: any) => (
                    <li key={t.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        t.points > 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                      }`}>
                        <TrendingUp className={`h-3.5 w-3.5 ${t.points < 0 && "rotate-180"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{t.reason}</div>
                        <div className="text-[10px] text-[#6b7280]">{formatDate(t.createdAt)}</div>
                      </div>
                      <div className={`text-sm font-bold ${t.points > 0 ? "text-emerald-300" : "text-red-300"}`}>
                        {t.points > 0 ? "+" : ""}{formatPoints(t.points)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right column — rewards + level ladder */}
          <div className="space-y-5">
            {/* Rewards */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-300" />
                <h3 className="text-sm font-semibold text-white">Trocar pontos</h3>
              </div>
              <ul className="divide-y divide-white/[0.04]">
                {DEFAULT_REWARDS.map((r) => {
                  const affordable = p.totalPoints >= r.pointsCost;
                  return (
                    <li key={r.key} className="px-4 py-3 flex items-center gap-3">
                      <div className="text-2xl">{r.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{r.name}</div>
                        <div className="text-[10px] text-[#6b7280]">{r.pointsCost.toLocaleString("pt-BR")} pts</div>
                      </div>
                      <RedeemButton rewardKey={r.key} rewardName={r.name} affordable={affordable} />
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Level ladder */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-300" />
                <h3 className="text-sm font-semibold text-white">Níveis</h3>
              </div>
              <ul className="divide-y divide-white/[0.04]">
                {(catalog?.levels ?? []).map((lvl: any) => {
                  const reached = p.totalPoints >= lvl.minPoints;
                  const isCurrent = lvl.key === level.key;
                  return (
                    <li
                      key={lvl.key}
                      className={`px-4 py-2.5 flex items-center gap-3 ${isCurrent ? "bg-violet-500/[0.06]" : ""}`}
                    >
                      <span className="text-xl">{lvl.icon}</span>
                      <span className="flex-1 text-sm font-medium text-white">{lvl.name}</span>
                      <span className="text-xs text-[#8b8fa3]">{formatPoints(lvl.minPoints)} pts</span>
                      {isCurrent && <Badge tone="violet">você</Badge>}
                      {!reached && !isCurrent && <span className="text-[10px] text-[#6b7280]">—</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
