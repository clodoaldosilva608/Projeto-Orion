import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { ListTree } from "lucide-react";

export const dynamic = "force-dynamic";

export default function FileProjetosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="File de Projetos"
          description="Gerencie a fila de projetos em desenvolvimento."
          icon={ListTree}
        />
        <EmptyState
          icon={ListTree}
          title="Nenhum dado disponível"
          description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
