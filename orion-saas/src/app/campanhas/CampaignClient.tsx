"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCampaignAction } from "@/lib/campanhas-actions";

const FILTERS: { id: "all" | "active" | "finished" | "draft"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Ativas" },
  { id: "draft", label: "Rascunhos" },
  { id: "finished", label: "Encerradas" },
];

export function CampaignFilter({
  current,
  counts,
}: {
  current: string;
  counts: { all: number; active: number; draft: number; finished: number };
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = current === f.id;
        const count = (counts as any)[f.id] ?? 0;
        return (
          <Link
            key={f.id}
            href={`/campanhas?filter=${f.id}`}
            className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
              active
                ? "bg-violet-500/15 text-white border border-violet-500/30"
                : "border border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white hover:bg-white/5"
            }`}
          >
            {f.label}
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${active ? "bg-violet-500/20 text-violet-200" : "bg-white/5 text-[#6b7280]"}`}>
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function DeleteCampaignButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm(`Excluir a campanha "${name}"? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      await deleteCampaignAction(id);
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      title="Excluir campanha"
      className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
