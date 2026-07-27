import DashboardLayout from "../dashboard/layout";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import { PageHeader } from "@/components/ui-parts";
import { listNotificationsAction } from "@/lib/p6-actions";
import { MarkReadButton, CreateNotificationForm } from "./NotificationsClient";

export const dynamic = "force-dynamic";

const PRIORITY_TONE: Record<string, { color: string; label: string }> = {
  low: { color: "text-[#8b8fa3] bg-white/5", label: "Baixa" },
  normal: { color: "text-sky-300 bg-sky-500/10", label: "Normal" },
  high: { color: "text-amber-300 bg-amber-500/10", label: "Alta" },
  urgent: { color: "text-red-300 bg-red-500/10", label: "Urgente" },
};

const CHANNEL_TONE: Record<string, string> = {
  in_app: "text-violet-300 bg-violet-500/10",
  email: "text-sky-300 bg-sky-500/10",
  sms: "text-emerald-300 bg-emerald-500/10",
  push: "text-amber-300 bg-amber-500/10",
  webhook: "text-fuchsia-300 bg-fuchsia-500/10",
};

export default async function NotificacoesPage() {
  const { data: notifications } = await listNotificationsAction();
  const list = notifications ?? [];
  const unreadCount = list.filter((n: any) => !n.readAt).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Notificações"
          description="Central de notificações do sistema e alertas importantes."
          icon={Bell}
          action={unreadCount > 0 ? <MarkReadButton /> : undefined}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{list.length}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Não lidas</div>
            <div className="text-2xl font-bold text-violet-300 mt-1">{unreadCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Urgentes</div>
            <div className="text-2xl font-bold text-red-300 mt-1">
              {list.filter((n: any) => n.priority === "urgent").length}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">E-mail</div>
            <div className="text-2xl font-bold text-sky-300 mt-1">
              {list.filter((n: any) => n.channel === "email").length}
            </div>
          </div>
        </div>

        {/* Create notification */}
        <CreateNotificationForm />

        {/* List */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Histórico de notificações</h3>
            {list.length > 0 && <span className="text-xs text-[#6b7280]">Últimas {list.length}</span>}
          </div>
          {list.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                <BellOff className="h-7 w-7 text-[#6b7280]" />
              </div>
              <p className="text-sm text-[#8b8fa3]">Nenhuma notificação ainda.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {list.map((n: any) => {
                const tone = PRIORITY_TONE[n.priority] ?? PRIORITY_TONE.normal;
                return (
                  <li
                    key={n.id}
                    className={`px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors ${n.readAt ? "opacity-60" : ""}`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${tone.color}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{n.title}</span>
                        <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${tone.color}`}>{tone.label}</span>
                        <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${CHANNEL_TONE[n.channel] ?? ""}`}>{n.channel.replace("_", " ")}</span>
                        {!n.readAt && <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />}
                      </div>
                      <p className="text-xs text-[#8b8fa3] mt-1">{n.body}</p>
                      <p className="text-[10px] text-[#6b7280] mt-1.5">
                        {new Date(n.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {!n.readAt && <MarkReadButton id={n.id} small />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
