"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, TrendingUp } from "lucide-react";
import { submitResultAction } from "@/lib/actions";

interface Goal {
  id: string;
  name: string;
  targetValue: number;
  indicator: {
    id: string;
    name: string;
    unit: string | null;
  };
}

export function SubmitResultForm({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    goalId: "",
    value: "",
    referenceDate: today,
    notes: "",
  });

  const selectedGoal = goals.find((g) => g.id === form.goalId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.goalId) {
      setError("Selecione uma meta");
      return;
    }
    if (!form.value || isNaN(Number(form.value))) {
      setError("Informe um valor numérico válido");
      return;
    }

    startTransition(async () => {
      const res = await submitResultAction({
        goalId: form.goalId,
        value: parseFloat(form.value),
        referenceDate: form.referenceDate,
        notes: form.notes || undefined,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Resultado lançado! Aguarda aprovação do gestor.");
        setForm({ goalId: "", value: "", referenceDate: today, notes: "" });
        router.refresh();
      }
    });
  };

  const inputClass =
    "w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 lg:p-6 space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/[0.06]">
        <TrendingUp className="h-4 w-4 text-violet-300" />
        Lançar Resultado
      </h3>

      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
          Meta *
        </label>
        <select
          required
          value={form.goalId}
          onChange={(e) => setForm({ ...form, goalId: e.target.value })}
          className={inputClass}
        >
          <option value="">Selecione...</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.indicator?.name})
            </option>
          ))}
        </select>
        {selectedGoal && (
          <p className="text-[11px] text-[#6b7280] mt-1.5">
            Alvo: {Number(selectedGoal.targetValue).toLocaleString("pt-BR")}{" "}
            {selectedGoal.indicator?.unit ?? ""}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Valor *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Data referência *
          </label>
          <input
            type="date"
            required
            value={form.referenceDate}
            onChange={(e) =>
              setForm({ ...form, referenceDate: e.target.value })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
          Observações
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notas opcionais..."
          className={`${inputClass} h-auto min-h-[70px] py-2.5 resize-y`}
        />
      </div>

      {error && (
        <div className="rounded-lg p-3 bg-red-500/5 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg p-3 bg-emerald-500/5 border border-emerald-500/30">
          <p className="text-sm text-emerald-300">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || goals.length === 0}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg brand-gradient h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isPending ? "Enviando..." : "Lançar Resultado"}
      </button>

      {goals.length === 0 && (
        <p className="text-[11px] text-amber-300 text-center">
          Nenhuma meta ativa. Crie uma meta em /metas primeiro.
        </p>
      )}
    </form>
  );
}
