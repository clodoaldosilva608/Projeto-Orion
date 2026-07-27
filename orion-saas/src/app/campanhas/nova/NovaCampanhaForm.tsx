"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Calendar, Settings2, Trophy } from "lucide-react";
import { createCampaignAction } from "@/lib/campanhas-actions";

export function NovaCampanhaForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rulesText, setRulesText] = useState(`{
  "pontosPorRealizacao": 10,
  "bonusMetaAtingida": 50,
  "pesoIndicador": {
    "vendas": 1.5,
    "atendimentos": 1.0
  }
}`);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const startDate = String(fd.get("startDate") ?? "");
    const endDate = String(fd.get("endDate") ?? "");
    const imageUrl = String(fd.get("imageUrl") ?? "").trim();

    if (!name || !startDate || !endDate) {
      setError("Nome, data de início e data de término são obrigatórios.");
      return;
    }

    let rules: Record<string, unknown> = {};
    if (rulesText.trim()) {
      try {
        rules = JSON.parse(rulesText);
      } catch {
        setError("Regras em JSON inválido. Corrija ou deixe em branco.");
        return;
      }
    }

    start(async () => {
      const { data, error } = await createCampaignAction({
        name,
        description: description || undefined,
        startDate,
        endDate,
        rules,
        imageUrl: imageUrl || undefined,
      });
      if (error) {
        setError(error);
        return;
      }
      if (data?.id) {
        router.push(`/campanhas/${data.id}`);
      } else {
        router.push("/campanhas");
      }
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const inOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="glass-card p-5 lg:p-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-violet-300" />
          <h3 className="text-sm font-semibold text-white">Informações básicas</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              Nome da campanha *
            </label>
            <input
              name="name"
              required
              placeholder="Ex: Corrida de Vendas Black Friday 2026"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              Descrição
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Descreva os objetivos e regras principais da campanha..."
              className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              <Calendar className="h-3 w-3 inline mr-1" />
              Data de início *
            </label>
            <input
              name="startDate"
              type="date"
              required
              defaultValue={today}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              <Calendar className="h-3 w-3 inline mr-1" />
              Data de término *
            </label>
            <input
              name="endDate"
              type="date"
              required
              defaultValue={inOneMonth}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              URL da imagem (opcional)
            </label>
            <input
              name="imageUrl"
              type="url"
              placeholder="https://..."
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        </div>
      </div>

      {/* Rules JSON */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-violet-300" />
          <h3 className="text-sm font-semibold text-white">Regras da campanha (JSON)</h3>
        </div>
        <p className="text-xs text-[#6b7280] mb-2">
          Define pesos, bônus, pontos por realização e outras regras customizadas. Pode ser editado depois.
        </p>
        <textarea
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          rows={8}
          className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-xs font-mono text-violet-200 outline-none focus:border-violet-400/50 resize-y"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => router.push("/campanhas")}
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
          Criar campanha
        </button>
      </div>
    </form>
  );
}
