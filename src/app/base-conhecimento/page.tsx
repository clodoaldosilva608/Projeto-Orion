import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BaseConhecimentoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Base de Conhecimento"
          description="Documentação e artigos de ajuda."
          icon={BookOpen}
        />
        <EmptyState
          icon={BookOpen}
          title="Nenhum dado disponível"
          description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
