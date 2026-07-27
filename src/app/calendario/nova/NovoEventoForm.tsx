"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Calendar } from "lucide-react";
import { createCalendarEventAction } from "@/lib/calendario-actions";

const TYPE_OPTIONS = [
  { value: "company_event", label: "Evento da Empresa", color: "#10b981" },
  { value: "meeting", label: "Reunião", color: "#3b82f6" },
  { value: "training", label: "Treinamento", color: "#06b6d4" },
  { value: "commemorative", label: "Data Comemorativa", color: "#f59e0b" },
  { value: "campaign_deadline", label: "Prazo de Campanha", color: "#8b5cf6" },
  { value: "holiday", label: "Feriado", color: "#ef4444" },
  { value: "other", label: "Outro", color: "#6b7280" },
];

const SCOPE_OPTIONS = [
  { value: "company", label: "Toda a empresa" },
  { value: "branch", label: "Filial específica" },
  { value: "team", label: "Equipe" },
  { value: "personal", label: "Pessoal (só eu)" },
];

export function NovoEventoForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("company_event");
  const [allDay, setAllDay] = useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const startDate = String(fd.get("startDate") ?? "");
    const startTime = String(fd.get("startTime") ?? "");
    const endDate = String(fd.get("endDate") ?? "");
    const endTime = String(fd.get("endTime") ?? "");
    const location = String(fd.get("location") ?? "").trim();
    const scope = String(fd.get("scope") ?? "company");

    if (!title || !startDate) {
      setError("Título e data de início são obrigatórios.");
      return;
    }

    // Build ISO datetime
    const startISO = allDay ? `${startDate}T09:00:00` : `${startDate}T${startTime || "09:00"}:00`;
    let endISO: string | undefined;
    if (endDate) {
      endISO = allDay ? `${endDate}T18:00:00` : `${endDate}T${endTime || "18:00"}:00`;
    }

    start(async () => {
      const { data, error } = await createCalendarEventAction({
        title,
        description: description || undefined,
        type: type as any,
        scope: scope as any,
        startDate: startISO,
        endDate: endISO,
        allDay,
        location: location || undefined,
      });
      if (error) {
        setError(error);
        return;
      }
      router.push("/calendario");
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="glass-card p-5 lg:p-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Type picker */}
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Tipo de evento</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`inline-flex items-center gap-2 h-10 px-3 rounded-lg text-xs font-medium transition-colors border ${
                type === t.value
                  ? "border-transparent text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white"
              }`}
              style={type === t.value ? { backgroundColor: `${t.color}22`, borderColor: `${t.color}66` } : {}}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Título *</label>
        <input
          name="title"
          required
          placeholder="Ex: Reunião mensal de vendas"
          className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Descrição</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Detalhes do evento..."
          className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
        />
      </div>

      {/* Date + time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Data de início *</label>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={today}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        {!allDay && (
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Hora de início</label>
            <input
              name="startTime"
              type="time"
              defaultValue="09:00"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Data de término (opcional)</label>
          <input
            name="endDate"
            type="date"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        {!allDay && (
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Hora de término</label>
            <input
              name="endTime"
              type="time"
              defaultValue="18:00"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        )}
      </div>

      {/* All day toggle */}
      <div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500"
          />
          <span className="text-sm text-[#c4c8d8]">Dia todo</span>
        </label>
      </div>

      {/* Scope + location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Escopo</label>
          <select
            name="scope"
            defaultValue="company"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
          >
            {SCOPE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Local (opcional)</label>
          <input
            name="location"
            placeholder="Ex: Sala 3 / Meet / Zoom"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => router.push("/calendario")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#8b8fa3] hover:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Criar evento
        </button>
      </div>
    </form>
  );
}
