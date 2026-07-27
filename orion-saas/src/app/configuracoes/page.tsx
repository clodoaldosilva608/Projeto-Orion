import DashboardLayout from "../dashboard/layout";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/ui-parts";
import { getSystemSettingsAction, listEmailQueueAction, listWebhookDeliveriesAction } from "@/lib/p6-actions";
import { ConfiguracoesClient } from "./ConfiguracoesClient";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const [{ data: settings }, { data: emailQueue }, { data: webhooks }] = await Promise.all([
    getSystemSettingsAction(),
    listEmailQueueAction(),
    listWebhookDeliveriesAction(),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Configurações"
          description="Ajuste as configurações da plataforma Orion — empresa, segurança, e-mail, webhooks e integrações."
          icon={Settings}
        />
        <ConfiguracoesClient
          initialSettings={(settings as any) ?? {}}
          emailQueue={(emailQueue as any) ?? []}
          webhookDeliveries={(webhooks as any) ?? []}
        />
      </div>
    </DashboardLayout>
  );
}
