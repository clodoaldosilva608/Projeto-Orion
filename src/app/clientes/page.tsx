import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ClientesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Clientes"
          description="Gerencie seus clientes e empresas cadastradas."
          icon={Users}
        />
        <EmptyState
          icon={Users}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
