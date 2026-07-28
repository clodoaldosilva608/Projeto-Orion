import DashboardLayout from "../dashboard/layout";
import { PageHeader } from "@/components/ui-parts";
import { LayoutGrid, Save, RotateCcw } from "lucide-react";
import { DragDropDashboard } from "./DragDropClient";

export const dynamic = "force-dynamic";

export default function WidgetsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader title="Dashboard Customizável" description="Arraste e solte os widgets para personalizar seu dashboard. As posições são salvas automaticamente." icon={LayoutGrid} />
        <DragDropDashboard />
      </div>
    </DashboardLayout>
  );
}
