import Link from "next/link";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { MessageSquare, Plus, CheckCircle2, Clock, Star, Award, Settings } from "lucide-react";
import { listAvailableFeedbacksAction } from "@/lib/feedback-actions";
import { FeedbackCard } from "./FeedbackClient";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  nps: "NPS (0-10)",
  csat: "CSAT (1-5)",
  ces: "CES (1-7)",
  rating: "Avaliação (1-5 ⭐)",
  open: "Resposta aberta",
  multiple_choice: "Múltipla escolha",
};

export default async function FeedbackPage() {
  const { data: feedbacks, error } = await listAvailableFeedbacksAction();
  const list = feedbacks ?? [];

  const pendingCount = list.filter((f: any) => !f.alreadyResponded).length;
  const respondedCount = list.filter((f: any) => f.alreadyResponded).length;
  const totalPoints = list.reduce((acc: number, f: any) => acc + f.pointsReward, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Sistema de Feedback"
          description="Participe de pesquisas e ajude a melhorar a plataforma. Ganhe pontos por cada resposta."
          icon={MessageSquare}
          action={
            <Link href="/feedback/admin">
              <PageButton variant="ghost">
                <Settings className="h-4 w-4" />
                Gerenciar pesquisas
              </PageButton>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Disponíveis</div>
            <div className="text-2xl font-bold text-white mt-1">{pendingCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Respondidas</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{respondedCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Pontos disponíveis</div>
            <div className="text-2xl font-bold text-violet-300 mt-1">{totalPoints}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total pesquisas</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{list.length}</div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* List */}
        {list.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Nenhuma pesquisa disponível</h3>
            <p className="text-sm text-[#8b8fa3] mb-4">
              No momento não há pesquisas ativas para você responder.
            </p>
            <Link
              href="/feedback/admin"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Criar pesquisa (admin)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {list.map((f: any) => (
              <FeedbackCard
                key={f.id}
                id={f.id}
                title={f.title}
                question={f.question}
                description={f.description}
                type={f.type}
                typeLabel={TYPE_LABEL[f.type] ?? f.type}
                pointsReward={f.pointsReward}
                isAnonymous={f.isAnonymous}
                alreadyResponded={f.alreadyResponded}
                options={f.options}
                lastResponse={f.lastResponse}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
