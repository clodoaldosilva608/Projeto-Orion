import DashboardLayout from "../dashboard/layout";
import { BookOpen, Plus, Search, Eye } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const ARTICLES = [
  { title: "Como configurar minha primeira aplicação", category: "Primeiros Passos", status: "Publicado", views: "4.218", date: "20/07/2025" },
  { title: "Integrando pagamento via Pix", category: "Integrações", status: "Publicado", views: "3.182", date: "18/07/2025" },
  { title: "Gerenciando licenças e assinaturas", category: "Licenciamento", status: "Publicado", views: "2.864", date: "15/07/2025" },
  { title: "Deploy em produção: passo a passo", category: "Deploy", status: "Publicado", views: "5.104", date: "12/07/2025" },
  { title: "Configurando webhooks", category: "Integrações", status: "Rascunho", views: "—", date: "10/07/2025" },
  { title: "Melhores práticas de segurança", category: "Segurança", status: "Publicado", views: "1.948", date: "08/07/2025" },
  { title: "Usando agentes de IA no seu projeto", category: "IA & Automação", status: "Publicado", views: "3.612", date: "05/07/2025" },
  { title: "Customizando a interface do app", category: "Personalização", status: "Publicado", views: "2.284", date: "02/07/2025" },
  { title: "Backup e restauração de dados", category: "Segurança", status: "Arquivado", views: "982", date: "28/06/2025" },
  { title: "Emitindo cupons de desconto", category: "Licenciamento", status: "Publicado", views: "1.488", date: "25/06/2025" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "neutral"> = {
  Publicado: "success",
  Rascunho: "warning",
  Arquivado: "neutral",
};

const CATEGORY_TONE: Record<string, "violet" | "info" | "success" | "warning"> = {
  "Primeiros Passos": "violet",
  "Integrações": "info",
  "Licenciamento": "success",
  "Deploy": "warning",
  "Segurança": "info",
  "IA & Automação": "violet",
  "Personalização": "info",
};

export default function BaseConhecimentoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Base de Conhecimento"
          description="Artigos de ajuda e documentação para clientes e equipe."
          icon={BookOpen}
          action={<PageButton><Plus className="h-4 w-4" />Novo Artigo</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Artigos Publicados", v: "184", c: "+12 este mês" },
            { l: "Visualizações no Mês", v: "28.482", c: "+14,2% vs mês anterior" },
            { l: "Rascunhos", v: "18", c: "Aguardando revisão" },
            { l: "Ticket Médio de Leitura", v: "3m 42s", c: "+12s vs mês anterior" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Artigos</h3>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <input
                placeholder="Buscar artigo..."
                className="h-9 w-64 rounded-lg bg-white/5 border border-white/[0.06] pl-9 pr-3 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-violet-400/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Título</th>
                  <th className="font-medium px-2 pb-3">Categoria</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Visualizações</th>
                  <th className="font-medium px-2 pb-3">Atualizado</th>
                  <th className="font-medium px-2 pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ARTICLES.map((a, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3 text-sm font-semibold text-white">{a.title}</td>
                    <td className="px-2 py-3"><Badge tone={CATEGORY_TONE[a.category]}>{a.category}</Badge></td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge></td>
                    <td className="px-2 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-[#8b8fa3]">
                        <Eye className="h-3.5 w-3.5" />
                        {a.views}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{a.date}</td>
                    <td className="px-2 py-3">
                      <button className="text-xs text-violet-300 hover:text-violet-200 font-medium">Editar</button>
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
