import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LicencasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Licenças"
          description="Controle licenças emitidas e suas validades."
          icon={KeyRound}
        />
        <EmptyState
          icon={KeyRound}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
