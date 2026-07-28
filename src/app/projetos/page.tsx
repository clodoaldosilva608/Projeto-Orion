import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { FolderKanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProjetosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Projetos"
          description="Gerencie projetos de software. Acesse a Fábrica para criar novos."
          icon={FolderKanban}
        />
        <EmptyState
          icon={FolderKanban}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
