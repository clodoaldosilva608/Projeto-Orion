import DashboardLayout from "../dashboard/layout";
import { MessageSquare, Plus, Bot, Globe, Smartphone, MessageCircle } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const CHATBOTS = [
  { name: "Orion Assistant", channel: "Web", status: "Ativo", conversations: "8.412", icon: Globe, color: "text-violet-300 bg-violet-500/15" },
  { name: "Suporte WhatsApp", channel: "WhatsApp", status: "Ativo", conversations: "5.218", icon: MessageCircle, color: "text-emerald-300 bg-emerald-500/15" },
  { name: "Bot Telegram", channel: "Telegram", status: "Ativo", conversations: "1.842", icon: MessageCircle, color: "text-sky-300 bg-sky-500/15" },
  { name: "App Mobile Bot", channel: "Mobile", status: "Manutenção", conversations: "3.104", icon: Smartphone, color: "text-amber-300 bg-amber-500/15" },
  { name: "Instagram DM", channel: "Instagram", status: "Ativo", conversations: "2.684", icon: MessageCircle, color: "text-fuchsia-300 bg-fuchsia-500/15" },
  { name: "FAQ Inteligente", channel: "Web", status: "Ativo", conversations: "12.418", icon: Bot, color: "text-indigo-300 bg-indigo-500/15" },
];

const STATUS_TONE: Record<string, "success" | "warning"> = {
  Ativo: "success",
  Manutenção: "warning",
};

export default function ChatbotsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Chatbots"
          description="Chatbots inteligentes para atendimento em múltiplos canais."
          icon={MessageSquare}
          action={<PageButton><Plus className="h-4 w-4" />Novo Chatbot</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Chatbots Ativos", v: "5", c: "de 6 configurados" },
            { l: "Conversas no Mês", v: "33.678", c: "+18,4% vs mês anterior" },
            { l: "Taxa de Resolução", v: "84,2%", c: "+2,1pp vs mês anterior" },
            { l: "Tempo Médio de Resposta", v: "1,8s", c: "-0,3s vs mês anterior" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {CHATBOTS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.name} className="glass-card glass-card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${b.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
                </div>
                <p className="text-base font-semibold text-white">{b.name}</p>
                <p className="text-xs text-[#8b8fa3] mt-0.5">Canal: {b.channel}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[#6b7280]">Conversas (mês)</p>
                    <p className="text-sm font-bold text-white">{b.conversations}</p>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-8 text-xs font-medium text-white hover:bg-white/10">
                    Configurar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
