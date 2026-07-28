import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Rocket } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DeploysPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Deploys"
          description="Monitore os deploys realizados."
          icon={Rocket}
        />
        <EmptyState
          icon={Rocket}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
