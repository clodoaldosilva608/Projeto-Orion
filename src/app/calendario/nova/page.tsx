import DashboardLayout from "../../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { Calendar } from "lucide-react";
import { NovoEventoForm } from "./NovoEventoForm";

export const dynamic = "force-dynamic";

export default function NovoEventoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[800px] mx-auto">
        <PageHeader
          title="Novo Evento"
          description="Crie um evento personalizado no calendário comercial."
          icon={Calendar}
        />
        <NovoEventoForm />
      </div>
    </DashboardLayout>
  );
}
