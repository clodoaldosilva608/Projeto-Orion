import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Bug } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AnomaliasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Anomalias"
          description="Monitore erros e anomalias do sistema."
          icon={Bug}
        />
        <EmptyState
          icon={Bug}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
