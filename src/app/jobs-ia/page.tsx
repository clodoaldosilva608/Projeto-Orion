import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export default function JobsIaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Jobs de IA"
          description="Acompanhe tarefas executadas por IA."
          icon={Cpu}
        />
        <EmptyState
          icon={Cpu}
          title="Nenhum dado disponível"
          description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
