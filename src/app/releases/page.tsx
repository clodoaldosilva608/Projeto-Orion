import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { Tags } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ReleasesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Releases"
          description="Gerencie versões e releases das aplicações."
          icon={Tags}
        />
        <EmptyState
          icon={Tags}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
