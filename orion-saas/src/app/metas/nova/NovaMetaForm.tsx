"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, Calendar, BarChart2, Loader2 } from "lucide-react";
import { createGoalAction } from "@/lib/actions";

interface Indicator {
  id: string;
  name: string;
  unit: string | null;
}

export function NovaMetaForm({ indicators }: { indicators: Indicator[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    indicatorId: "",
    targetValue: "",
    type: "monthly",
    startDate: "",
    endDate: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.indicatorId) {
      setError("Selecione um indicador");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Informe as datas de início e fim");
      return;
    }

    startTransition(async () => {
      const result = await createGoalAction({
        name: formData.name,
        description: formData.description || undefined,
        indicatorId: formData.indicatorId,
        targetValue: parseFloat(formData.targetValue),
        type: formData.type as
          | "daily"
          | "weekly"
          | "monthly"
          | "quarterly"
          | "yearly"
          | "custom",
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/metas");
        router.refresh();
      }
    });
  };

  const inputClass =
    "w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detalhes da Meta */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Target className="h-4 w-4 text-violet-300" />
            <h3 className="font-semibold text-white">Detalhes da Meta</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              Nome da Meta *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Recorde de Vendas Julho"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Objetivo principal desta meta..."
              className={`${inputClass} h-auto min-h-[100px] py-2.5 resize-y`}
            />
          </div>
        </div>

        {/* Métricas e Prazos */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <BarChart2 className="h-4 w-4 text-fuchsia-300" />
            <h3 className="font-semibold text-white">Métrica e Prazo</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
                Indicador *
              </label>
              <select
                required
                value={formData.indicatorId}
                onChange={(e) => handleChange("indicatorId", e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {indicators.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                    {ind.unit ? ` (${ind.unit})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
                Valor Alvo *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.targetValue}
                onChange={(e) => handleChange("targetValue", e.target.value)}
                placeholder="Ex: 50000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              Tipo de Meta
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className={inputClass}
            >
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
                <Calendar className="h-3 w-3 inline mr-1" />
                Data Início *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
                <Calendar className="h-3 w-3 inline mr-1" />
                Data Fim *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
        <Link
          href="/metas"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 h-10 text-sm font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg brand-gradient px-6 h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Salvando..." : "Salvar Meta"}
        </button>
      </div>
    </form>
  );
}
