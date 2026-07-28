import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Plug, Database, Plus, RefreshCw, Trash2, CheckCircle2 } from "lucide-react";
import { ErpIntegrationClient } from "./ErpClient";

export const dynamic = "force-dynamic";

const ERP_TYPES = [
  { id: "totvs", name: "Totvs Protheus", icon: "🏢", desc: "ERP corporativo para gestão empresarial" },
  { id: "sap_b1", name: "SAP Business One", icon: "🔵", desc: "Solução SAP para pequenas e médias empresas" },
  { id: "sankhya", name: "Sankhya", icon: "🟠", desc: "ERP brasileiro para gestão integrada" },
  { id: "bentry", name: "Bentry", icon: "🟢", desc: "ERP financeiro e fiscal" },
  { id: "custom", name: "API Customizada", icon: "🔌", desc: "Integração via REST API personalizada" },
];

export default async function IntegracoesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader title="Integrações ERP" description="Conecte a plataforma Orion com sistemas ERP para sincronização de dados." icon={Plug} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ERP_TYPES.map((erp) => (
            <div key={erp.id} className="glass-card p-5 flex flex-col gap-2">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-2xl">{erp.icon}</div><div><h3 className="text-sm font-semibold text-white">{erp.name}</h3></div></div>
              <p className="text-xs text-[#8b8fa3]">{erp.desc}</p>
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.06]">
                <Badge tone="neutral">Disponível</Badge>
              </div>
            </div>
          ))}
        </div>
        <ErpIntegrationClient />
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Como funciona</h3>
          <div className="space-y-2 text-xs text-[#8b8fa3]">
            <p><strong className="text-violet-300">1.</strong> Configure a integração com seu ERP fornecendo API URL, chave e segredo.</p>
            <p><strong className="text-violet-300">2.</strong> Escolha o intervalo de sincronização (tempo real, horário, diário).</p>
            <p><strong className="text-violet-300">3.</strong> O Orion sincroniza produtos, estoque, clientes e pedidos automaticamente.</p>
            <p><strong className="text-violet-300">4.</strong> Webhooks notificam eventos como estoque baixo ou produto atualizado.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
