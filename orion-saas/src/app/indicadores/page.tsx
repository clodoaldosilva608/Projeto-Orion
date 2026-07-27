import Link from "next/link";
import { BarChart3, AlertCircle } from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { IndicadoresClient } from "./IndicadoresClient";
import { listCategoriesAction, listIndicatorsAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function IndicadoresPage() {
  const [categoriesRes, indicatorsRes] = await Promise.all([
    listCategoriesAction(),
    listIndicatorsAction(),
  ]);

  const error = categoriesRes.error || indicatorsRes.error;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Indicadores"
          description="Construa e gerencie os KPIs da sua empresa."
          icon={BarChart3}
        />

        {/* Quick navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/metas"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Metas
          </Link>
          <Link
            href="/resultados"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Resultados
          </Link>
          <Link
            href="/aprovacoes"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Aprovações
          </Link>
          <Link
            href="/ranking"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Ranking
          </Link>
        </div>

        {error && (
          <div className="glass-card p-4 flex items-center gap-3 border-red-500/30">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <IndicadoresClient
          categories={categoriesRes.data ?? []}
          indicators={indicatorsRes.data ?? []}
        />
      </div>
    </DashboardLayout>
  );
}
