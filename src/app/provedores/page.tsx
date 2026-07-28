import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Server } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProvedoresPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Provedores de IA"
          description="Configure provedores de IA (OpenAI, Anthropic, etc.)."
          icon={Server}
        />
        <EmptyState
          icon={Server}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
