import Link from "next/link";
import { ArrowLeft, AlertCircle, Target } from "lucide-react";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { NovaMetaForm } from "./NovaMetaForm";
import { listIndicatorsAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function NovaMetaPage() {
  const { data: indicators, error } = await listIndicatorsAction();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="Criar Nova Meta"
          description="Configure um novo objetivo de performance para a equipe."
          icon={Target}
          action={
            <Link
              href="/metas"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 h-10 text-sm font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Metas
            </Link>
          }
        />

        {error && (
          <div className="glass-card p-4 flex items-center gap-3 border-red-500/30">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {indicators && indicators.length === 0 && !error && (
          <div className="glass-card p-6 border-amber-500/30 bg-amber-500/5">
            <p className="text-sm text-amber-300">
              Nenhum indicador cadastrado. Crie um indicador em{" "}
              <Link href="/indicadores" className="underline">
                /indicadores
              </Link>{" "}
              antes de criar uma meta.
            </p>
          </div>
        )}

        {indicators && indicators.length > 0 && (
          <NovaMetaForm indicators={indicators} />
        )}
      </div>
    </DashboardLayout>
  );
}
