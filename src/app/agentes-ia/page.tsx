import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Bot } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AgentesIaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Agentes de IA"
          description="Configure agentes de IA para automação."
          icon={Bot}
        />
        <EmptyState
          icon={Bot}
          title="Nenhum dado disponível"
          description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
