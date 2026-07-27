import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Award, Lock, CheckCircle2 } from "lucide-react";
import { getUserProfileAction } from "@/lib/gamification-actions";
import { ACHIEVEMENTS } from "@/lib/gamification";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  streak: "Sequência",
  goal: "Metas",
  campaign: "Campanhas",
  result: "Resultados",
  client: "Clientes",
  special: "Especiais",
};

const CATEGORY_TONE: Record<string, string> = {
  streak: "bg-orange-500/10 text-orange-300",
  goal: "bg-violet-500/10 text-violet-300",
  campaign: "bg-amber-500/10 text-amber-300",
  result: "bg-sky-500/10 text-sky-300",
  client: "bg-emerald-500/10 text-emerald-300",
  special: "bg-fuchsia-500/10 text-fuchsia-300",
};

export default async function ConquistasPage() {
  const { data: profile } = await getUserProfileAction();
  const unlockedKeys = new Set((profile?.achievements ?? []).map((a: any) => a.achievementKey));

  // Group by category
  const byCategory = ACHIEVEMENTS.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {} as Record<string, typeof ACHIEVEMENTS>);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Catálogo de Conquistas"
          description="Desbloqueie conquistas lançando resultados, batendo metas, participando de campanhas e mais."
          icon={Award}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{ACHIEVEMENTS.length}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Desbloqueadas</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{unlockedKeys.size}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Bloqueadas</div>
            <div className="text-2xl font-bold text-[#8b8fa3] mt-1">{ACHIEVEMENTS.length - unlockedKeys.size}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Progresso</div>
            <div className="text-2xl font-bold text-violet-300 mt-1">
              {Math.round((unlockedKeys.size / ACHIEVEMENTS.length) * 100)}%
            </div>
          </div>
        </div>

        {/* By category */}
        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="glass-card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${CATEGORY_TONE[cat]}`}>
                  {CATEGORY_LABEL[cat] ?? cat}
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {items.filter((i) => unlockedKeys.has(i.key)).length}/{items.length} desbloqueadas
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
              {items.map((a) => {
                const unlocked = unlockedKeys.has(a.key);
                return (
                  <div
                    key={a.key}
                    className={`rounded-lg border p-4 transition-all ${
                      unlocked
                        ? "border-amber-500/30 bg-amber-500/[0.06]"
                        : "border-white/[0.04] bg-white/[0.02] opacity-70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl ${!unlocked && "grayscale opacity-60"}`}>{a.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white">{a.name}</div>
                        <div className="text-xs text-[#8b8fa3] mt-0.5">{a.description}</div>
                        {a.threshold && (
                          <div className="text-[10px] text-[#6b7280] mt-1.5">
                            Meta: {a.threshold.type === "count" ? `${a.threshold.value}x` : `${a.threshold.value} ${a.threshold.type === "streak" ? "dias" : ""}`}
                          </div>
                        )}
                      </div>
                      {unlocked ? (
                        <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-[#6b7280] shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
