import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ChatbotsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Chatbots"
          description="Configure chatbots de atendimento."
          icon={MessageSquare}
        />
        <EmptyState
          icon={MessageSquare}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
