"use client";

import Link from "next/link";

const TABS: { id: "month" | "all"; label: string }[] = [
  { id: "month", label: "Este mês" },
  { id: "all", label: "Todos os tempos" },
];

export function LeaderboardTabs({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const active = current === t.id;
        return (
          <Link
            key={t.id}
            href={`/gamificacao/leaderboard?period=${t.id}`}
            className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
              active
                ? "bg-violet-500/15 text-white border border-violet-500/30"
                : "border border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
