import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Hammer } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BuildsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Builds"
          description="Acompanhe os builds das aplicações."
          icon={Hammer}
        />
        <EmptyState
          icon={Hammer}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
