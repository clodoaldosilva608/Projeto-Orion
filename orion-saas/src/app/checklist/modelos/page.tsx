import Link from "next/link";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { ListChecks, Plus, Edit, Trash2, Clock, Calendar } from "lucide-react";
import { listTemplatesAction } from "@/lib/checklist-actions";
import { DeleteTemplateButton, NewTemplateForm } from "./TemplatesClient";

export const dynamic = "force-dynamic";

const SCOPE_LABEL: Record<string, string> = {
  personal: "Pessoal",
  role: "Por cargo",
  team: "Equipe",
  company: "Toda empresa",
};

const WEEKDAY_LABELS: Record<string, string> = {
  "1": "Seg", "2": "Ter", "3": "Qua", "4": "Qui", "5": "Sex", "6": "Sáb", "7": "Dom",
};

function parseWeekdays(s: string): string[] {
  return s.split(",").map((d) => d.trim()).filter(Boolean);
}

export default async function ModelosPage() {
  const { data: templates, error } = await listTemplatesAction();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1100px] mx-auto">
        <PageHeader
          title="Modelos de Checklist"
          description="Crie modelos de tarefas recorrentes que geram checklists diários automaticamente."
          icon={ListChecks}
        />

        {/* New template form */}
        <NewTemplateForm />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Templates list */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-white">Modelos existentes</h3>
            </div>
            <span className="text-xs text-[#6b7280]">
              {(templates ?? []).length} modelo(s)
            </span>
          </div>

          {(!templates || templates.length === 0) ? (
            <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">
              Nenhum modelo criado ainda. Use o formulário acima para criar o primeiro.
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {templates.map((t: any) => {
                const weekdays = parseWeekdays(t.weekdays);
                return (
                  <li key={t.id} className="px-5 py-4 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 shrink-0">
                      <ListChecks className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                        <Badge tone={t.isActive ? "success" : "neutral"}>
                          {t.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge tone="info">{SCOPE_LABEL[t.scope] ?? t.scope}</Badge>
                      </div>
                      {t.description && (
                        <p className="text-xs text-[#8b8fa3] mt-0.5 line-clamp-1">{t.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#6b7280]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {weekdays.map((d) => WEEKDAY_LABELS[d] ?? d).join(", ")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t.startsAt} – {t.endsAt}
                        </span>
                        <span>{t.itemsCount} itens</span>
                      </div>
                    </div>
                    <DeleteTemplateButton id={t.id} name={t.name} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="text-center">
          <Link href="/checklist" className="inline-flex items-center text-xs text-[#8b8fa3] hover:text-white">
            ← Voltar para o checklist do dia
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
