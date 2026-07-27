"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCalendarEventAction } from "@/lib/calendario-actions";

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "holiday", label: "Feriados" },
  { value: "commemorative", label: "Comemorativas" },
  { value: "campaign_deadline", label: "Campanhas" },
  { value: "company_event", label: "Eventos" },
  { value: "meeting", label: "Reuniões" },
  { value: "training", label: "Treinamentos" },
  { value: "other", label: "Outros" },
];

const SCOPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos os escopos" },
  { value: "company", label: "Empresa" },
  { value: "branch", label: "Filial" },
  { value: "team", label: "Equipe" },
  { value: "personal", label: "Pessoal" },
];

export function CalendarFilters({
  year,
  month,
  type,
  scope,
}: {
  year: number;
  month: number;
  type: string;
  scope: string;
}) {
  return (
    <div className="glass-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-white">Filtros</h3>
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Tipo</label>
        <select
          defaultValue={type}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("type", e.target.value);
            window.location.href = url.toString();
          }}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Escopo</label>
        <select
          defaultValue={scope}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("scope", e.target.value);
            window.location.href = url.toString();
          }}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
        >
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <Link
        href={`/calendario?year=${year}&month=${month}`}
        className="inline-flex items-center justify-center w-full h-8 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#8b8fa3] hover:text-white"
      >
        Limpar filtros
      </Link>
    </div>
  );
}

export function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm(`Excluir o evento "${title}"?`)) return;
    start(async () => {
      await deleteCalendarEventAction(id);
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      title="Excluir evento"
      className="inline-flex items-center justify-center h-8 w-8 rounded text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
