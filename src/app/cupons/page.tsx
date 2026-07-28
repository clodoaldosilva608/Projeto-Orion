import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { TicketPercent } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CuponsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Cupons"
          description="Crie cupons de desconto para promoções."
          icon={TicketPercent}
        />
        <EmptyState
          icon={TicketPercent}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
