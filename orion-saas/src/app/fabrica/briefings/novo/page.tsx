import DashboardLayout from "../../../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { ClipboardList } from "lucide-react";
import { NovoBriefingForm } from "./NovoBriefingForm";

export const dynamic = "force-dynamic";

export default function NovoBriefingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[900px] mx-auto">
        <PageHeader
          title="Novo Briefing"
          description="Estruture os requisitos do cliente. A IA gera PRD + arquitetura + estimativas após salvar."
          icon={ClipboardList}
        />
        <NovoBriefingForm />
      </div>
    </DashboardLayout>
  );
}
