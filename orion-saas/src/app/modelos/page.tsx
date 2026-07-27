import DashboardLayout from "../dashboard/layout";
import { Boxes, Plus } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const MODELS = [
  { name: "GPT-4o", provider: "OpenAI", type: "LLM Multimodal", status: "Ativo", context: "128k tokens", cost: "$2.50 / 1M in" },
  { name: "GPT-4o-mini", provider: "OpenAI", type: "LLM", status: "Ativo", context: "128k tokens", cost: "$0.15 / 1M in" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", type: "LLM", status: "Ativo", context: "200k tokens", cost: "$3.00 / 1M in" },
  { name: "Claude 3 Haiku", provider: "Anthropic", type: "LLM Rápido", status: "Ativo", context: "200k tokens", cost: "$0.25 / 1M in" },
  { name: "Gemini 1.5 Pro", provider: "Google", type: "LLM Multimodal", status: "Ativo", context: "2M tokens", cost: "$1.25 / 1M in" },
  { name: "Llama 3.1 70B", provider: "Meta (Self-hosted)", type: "LLM Open Source", status: "Manutenção", context: "128k tokens", cost: "$0.00 (self)" },
  { name: "text-embedding-3-large", provider: "OpenAI", type: "Embedding", status: "Ativo", context: "8.1k tokens", cost: "$0.13 / 1M in" },
  { name: "DALL-E 3", provider: "OpenAI", type: "Geração de Imagem", status: "Ativo", context: "—", cost: "$0.040 / imagem" },
];

const STATUS_TONE: Record<string, "success" | "warning"> = {
  Ativo: "success",
  Manutenção: "warning",
};

export default function ModelosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Modelos de IA"
          description="Modelos de IA disponíveis para os agentes e jobs."
          icon={Boxes}
          action={<PageButton><Plus className="h-4 w-4" />Adicionar Modelo</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Modelos Disponíveis", v: "8", c: "de 5 provedores" },
            { l: "Modelos Ativos", v: "7", c: "87,5% do total" },
            { l: "Custo no Mês", v: "$3.842,00", c: "+8,2% vs mês anterior" },
            { l: "Tokens Processados", v: "271,7k", c: "no mês atual" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Lista de Modelos</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Modelo</th>
                  <th className="font-medium px-2 pb-3">Provedor</th>
                  <th className="font-medium px-2 pb-3">Tipo</th>
                  <th className="font-medium px-2 pb-3">Contexto</th>
                  <th className="font-medium px-2 pb-3">Custo</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MODELS.map((m) => (
                  <tr key={m.name} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3 text-sm font-semibold text-white">{m.name}</td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{m.provider}</td>
                    <td className="px-2 py-3"><Badge tone="violet">{m.type}</Badge></td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{m.context}</td>
                    <td className="px-2 py-3 text-sm font-mono text-emerald-400">{m.cost}</td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
