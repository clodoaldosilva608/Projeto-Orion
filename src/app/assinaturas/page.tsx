import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Repeat } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AssinaturasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Assinaturas"
          description="Gerencie assinaturas ativas dos clientes."
          icon={Repeat}
        />
        <EmptyState
          icon={Repeat}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
