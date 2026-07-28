import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { EmptyState } from "@/components/EmptyState";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PagamentosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Pagamentos"
          description="Acompanhe transações e receitas da plataforma."
          icon={CreditCard}
        />
        <EmptyState
          icon={CreditCard}
          title="Nenhum dado disponível"
         description="Os dados aparecerão aqui quando houver registros no sistema."
        />
      </div>
    </DashboardLayout>
  );
}
