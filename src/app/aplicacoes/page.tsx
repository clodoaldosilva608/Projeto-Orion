import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { AppWindow } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AplicacoesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Aplicações"
          description="Acompanhe as aplicações desenvolvidas pela fábrica."
          icon={AppWindow}
        />
        <EmptyState
          icon={AppWindow}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
