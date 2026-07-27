import DashboardLayout from "../dashboard/layout";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Brain, Zap, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { IaClient } from "./IaClient";

export const dynamic = "force-dynamic";

export default async function ConsumoIaPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Dados mockados de consumo (em produção, viria de logs de IA)
  const aiData = {
    totalTokens: 24586,
    totalCost: 12.34,
    avgDailyTokens: 1756,
    tokensByDay: [
      { day: "01", value: 12500 }, { day: "02", value: 14800 }, { day: "03", value: 13200 },
      { day: "04", value: 16500 }, { day: "05", value: 18200 }, { day: "06", value: 17100 },
      { day: "07", value: 19500 }, { day: "08", value: 21300 }, { day: "09", value: 20100 },
      { day: "10", value: 22800 }, { day: "11", value: 21500 }, { day: "12", value: 23900 },
      { day: "13", value: 24200 }, { day: "14", value: 25100 },
    ],
    models: [
      { name: "GPT-4o-mini", tokens: 18923, cost: 9.46, percentage: 77 },
      { name: "GPT-4o", tokens: 4521, cost: 2.42, percentage: 18 },
      { name: "Text-embedding-3", tokens: 1142, cost: 0.46, percentage: 5 },
    ],
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Consumo de IA</h1>
          <p className="text-sm mt-1 text-secondary">Monitore o uso e custo de Inteligência Artificial</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-500/15"><Zap className="w-4 h-4 text-purple-400" /></div></div>
            <p className="text-2xl font-bold text-white">{aiData.totalTokens.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted">Total de tokens</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-500/15"><DollarSign className="w-4 h-4 text-green-400" /></div></div>
            <p className="text-2xl font-bold text-white">R$ {aiData.totalCost.toFixed(2)}</p>
            <p className="text-xs text-muted">Custo total</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/15"><TrendingUp className="w-4 h-4 text-blue-400" /></div></div>
            <p className="text-2xl font-bold text-white">{aiData.avgDailyTokens.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted">Média diária</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/15"><Brain className="w-4 h-4 text-amber-400" /></div></div>
            <p className="text-2xl font-bold text-white">{aiData.models.length}</p>
            <p className="text-xs text-muted">Modelos ativos</p>
          </div>
        </div>

        {/* Chart + Models */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4">Consumo de Tokens (14 dias)</h3>
            <div className="flex items-end gap-1.5 h-40">
              {aiData.tokensByDay.map((d, i) => {
                const max = Math.max(...aiData.tokensByDay.map(x => x.value))
                const height = (d.value / max) * 100
                const isLast = i === aiData.tokensByDay.length - 1
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full flex-1 flex items-end">
                      <div className="w-full rounded-t-md transition-all cursor-pointer" style={{
                        height: `${height}%`, minHeight: '4px',
                        background: isLast ? 'linear-gradient(180deg, #a855f7, #ec4899)' : 'linear-gradient(180deg, rgba(139,92,246,0.6), rgba(236,72,153,0.3))',
                      }} />
                    </div>
                    <span className="text-tiny text-muted">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Modelos</h3>
            <div className="space-y-3">
              {aiData.models.map((m) => (
                <div key={m.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-primary">{m.name}</span>
                    <span className="text-sm font-bold text-white">{m.percentage}%</span>
                  </div>
                  <div className="progress-bar mb-1">
                    <div className="progress-bar-fill" style={{ width: `${m.percentage}%`, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
                  </div>
                  <div className="flex items-center justify-between text-tiny text-muted">
                    <span>{m.tokens.toLocaleString('pt-BR')} tokens</span>
                    <span>R$ {m.cost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Assistente IA</h3>
          <IaClient />
        </div>
      </div>
    </DashboardLayout>
  );
}
