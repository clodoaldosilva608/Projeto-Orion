import Link from "next/link";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, PageButton } from "@/components/ui-parts";
import { ClipboardList, ArrowRight, Sparkles, FileText, Lightbulb, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BriefingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Briefings de Projeto"
          description="Estruture os requisitos do cliente. A IA gera documentação e sugestões de arquitetura automaticamente."
          icon={ClipboardList}
          action={
            <Link href="/fabrica/projetos">
              <PageButton>
                <ClipboardList className="h-4 w-4" />
                Novo Briefing
              </PageButton>
            </Link>
          }
        />

        {/* Coming soon — IA briefing */}
        <div className="glass-card p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-3">
              <Sparkles className="h-3 w-3" />
              EM BREVE — P15
            </div>
            <h2 className="text-2xl font-bold text-white">
              Briefing Inteligente com IA
            </h2>
            <p className="text-sm text-[#8b8fa3] mt-2 max-w-2xl">
              O cliente responde um formulário estruturado. A IA do Orion gera
              automaticamente:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <FeatureCard
                icon={<FileText className="h-5 w-5" />}
                title="PRD gerado por IA"
                description="Documento de Requisitos de Produto completo, com user stories, critérios de aceite e escopo."
                color="#8b5cf6"
              />
              <FeatureCard
                icon={<Lightbulb className="h-5 w-5" />}
                title="Sugestões de Arquitetura"
                description="Stack tecnológica recomendada, estrutura de pastas, modelo de dados inicial."
                color="#10b981"
              />
              <FeatureCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Estimativa Automática"
                description="Horas estimadas, custo sugerido e timeline com base no escopo e templates similares."
                color="#f59e0b"
              />
            </div>

            <div className="mt-6 p-4 rounded-lg border border-violet-500/20 bg-violet-500/[0.04]">
              <p className="text-xs text-[#c4c8d8]">
                <strong className="text-violet-300">Status atual (P14):</strong> A estrutura de dados
                está pronta (tabela <code className="text-violet-200">project_briefings</code>).
                A implementação do formulário + IA será feita na fase P15.
              </p>
            </div>

            <Link
              href="/fabrica/projetos"
              className="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"
            >
              Criar projeto manualmente
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function FeatureCard({
  icon, title, description, color,
}: {
  icon: React.ReactNode; title: string; description: string; color: string;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: `${color}11`, borderColor: `${color}33` }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs text-[#8b8fa3]">{description}</p>
    </div>
  );
}
