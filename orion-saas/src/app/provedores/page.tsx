import DashboardLayout from "../dashboard/layout";
import { Server, Plus, Eye, EyeOff } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const PROVIDERS = [
  { name: "OpenAI", type: "LLM + Embedding + Imagem", status: "Conectado", apiKey: "sk-proj-•••••••••••••••••••••••••••3Xy9", cost: "$2.420,00" },
  { name: "Anthropic", type: "LLM", status: "Conectado", apiKey: "sk-ant-•••••••••••••••••••••••••••8Kq2", cost: "$920,00" },
  { name: "Google AI", type: "LLM Multimodal", status: "Conectado", apiKey: "AIza•••••••••••••••••••••••••••5Mw7", cost: "$320,00" },
  { name: "Meta (Self-hosted)", type: "LLM Open Source", status: "Manutenção", apiKey: "localhost:8080", cost: "$182,00" },
  { name: "Hugging Face", type: "Modelos Open Source", status: "Conectado", apiKey: "hf_•••••••••••••••••••••••••••1Tp4", cost: "$0,00" },
  { name: "Replicate", type: "Inferência Sob Demanda", status: "Desconectado", apiKey: "—", cost: "$0,00" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "danger"> = {
  Conectado: "success",
  Manutenção: "warning",
  Desconectado: "danger",
};

export default function ProvedoresPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Provedores de IA"
          description="Integrações com provedores de modelos de IA."
          icon={Server}
          action={<PageButton><Plus className="h-4 w-4" />Adicionar Provedor</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Provedores Conectados", v: "4", c: "de 6 configurados" },
            { l: "Custo Total no Mês", v: "$3.842,00", c: "+8,2% vs mês anterior" },
            { l: "Latência Média", v: "412ms", c: "-24ms vs mês anterior" },
            { l: "Uptime Médio", v: "99,7%", c: "Acima do SLA (99,5%)" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Lista de Provedores</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Provedor</th>
                  <th className="font-medium px-2 pb-3">Tipo</th>
                  <th className="font-medium px-2 pb-3">API Key</th>
                  <th className="font-medium px-2 pb-3">Custo no Mês</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PROVIDERS.map((p) => (
                  <tr key={p.name} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3 text-sm font-semibold text-white">{p.name}</td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{p.type}</td>
                    <td className="px-2 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs font-mono text-[#8b8fa3]">
                        {p.apiKey}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm font-bold text-emerald-400">{p.cost}</td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></td>
                    <td className="px-2 py-3">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-white/5">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
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
