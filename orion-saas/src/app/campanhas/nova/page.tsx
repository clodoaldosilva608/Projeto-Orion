import DashboardLayout from "../../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { Trophy } from "lucide-react";
import { NovaCampanhaForm } from "./NovaCampanhaForm";

export const dynamic = "force-dynamic";

export default function NovaCampanhaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[900px] mx-auto">
        <PageHeader
          title="Nova Campanha"
          description="Configure uma nova campanha motivacional para sua equipe."
          icon={Trophy}
        />
        <NovaCampanhaForm />
      </div>
    </DashboardLayout>
  );
}
