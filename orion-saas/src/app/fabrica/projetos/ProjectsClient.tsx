"use client";

import Link from "next/link";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "briefing", label: "Briefing" },
  { value: "architecting", label: "Arquitetura" },
  { value: "developing", label: "Desenvolvimento" },
  { value: "testing", label: "Testes" },
  { value: "deploying", label: "Deploy" },
  { value: "delivered", label: "Entregue" },
  { value: "maintenance", label: "Manutenção" },
];

export function ProjectFilters({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <Link
            key={opt.value}
            href={opt.value === "all" ? "/fabrica/projetos" : `/fabrica/projetos?status=${opt.value}`}
            className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
              active
                ? "bg-violet-500/15 text-white border border-violet-500/30"
                : "border border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
