import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Boxes } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ModelosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Modelos de IA"
          description="Gerencie modelos de IA disponíveis."
          icon={Boxes}
        />
        <EmptyState
          icon={Boxes}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
