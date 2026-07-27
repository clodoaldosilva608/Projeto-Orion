"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, ChevronRight, Check, X, Plus, Users, FileText,
  ExternalLink, Clock, Edit3, Save, Github,
} from "lucide-react";
import {
  updateStageStatusAction,
  assignStageTeamAction,
  addStageDeliverableAction,
  toggleDeliverableAction,
  removeDeliverableAction,
  updateStageNotesAction,
} from "@/lib/fabrica-actions";
import { saveSystemSettingAction } from "@/lib/p6-actions";

const STAGE_ICONS: Record<string, string> = {
  "Briefing": "📋",
  "Arquitetura": "🏗️",
  "Desenvolvimento": "💻",
  "Testes": "🧪",
  "Deploy": "🚀",
  "Entrega": "✅",
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  pending: { bg: "bg-white/[0.02]", border: "border-white/[0.06]", text: "text-[#6b7280]", dot: "#6b7280" },
  active: { bg: "bg-violet-500/[0.06]", border: "border-violet-500/30", text: "text-violet-300", dot: "#8b5cf6" },
  completed: { bg: "bg-emerald-500/[0.06]", border: "border-emerald-500/30", text: "text-emerald-300", dot: "#10b981" },
  blocked: { bg: "bg-red-500/[0.06]", border: "border-red-500/30", text: "text-red-300", dot: "#ef4444" },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  active: "Ativo",
  completed: "Concluído",
  blocked: "Bloqueado",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "active",
  active: "completed",
  completed: "active", // can reopen
  blocked: "active",
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function KanbanBoard({
  stages,
  companyUsers,
}: {
  stages: any[];
  companyUsers: any[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Pipeline de Desenvolvimento</h3>
        <span className="text-xs text-[#6b7280]">
          {stages.filter((s) => s.status === "completed").length}/{stages.length} concluídos
        </span>
      </div>

      {/* Horizontal scroll kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              companyUsers={companyUsers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  companyUsers,
}: {
  stage: any;
  companyUsers: any[];
}) {
  const [pending, start] = useTransition();
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showDeliverableForm, setShowDeliverableForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [newDeliverableName, setNewDeliverableName] = useState("");
  const [newDeliverableUrl, setNewDeliverableUrl] = useState("");
  const [notesValue, setNotesValue] = useState(stage.notes ?? "");
  const router = useRouter();

  const colors = STATUS_COLORS[stage.status] ?? STATUS_COLORS.pending;
  const icon = STAGE_ICONS[stage.name] ?? "📦";
  const deliverables = (stage.deliverables as any[]) ?? [];
  const assignedTo = (stage.assignedTo as string[]) ?? [];
  const assignedUsers = companyUsers.filter((u) => assignedTo.includes(u.id));

  function advanceStatus() {
    const next = NEXT_STATUS[stage.status] ?? "active";
    start(async () => {
      await updateStageStatusAction(stage.id, next);
      router.refresh();
    });
  }

  function toggleAssign(userId: string) {
    const newAssigned = assignedTo.includes(userId)
      ? assignedTo.filter((id) => id !== userId)
      : [...assignedTo, userId];
    start(async () => {
      await assignStageTeamAction(stage.id, newAssigned);
      router.refresh();
    });
  }

  function addDeliverable() {
    if (!newDeliverableName.trim()) return;
    start(async () => {
      await addStageDeliverableAction(stage.id, newDeliverableName.trim(), newDeliverableUrl.trim() || undefined);
      setNewDeliverableName("");
      setNewDeliverableUrl("");
      setShowDeliverableForm(false);
      router.refresh();
    });
  }

  function toggleDeliv(index: number) {
    start(async () => {
      await toggleDeliverableAction(stage.id, index);
      router.refresh();
    });
  }

  function removeDeliv(index: number) {
    if (!confirm("Remover este deliverable?")) return;
    start(async () => {
      await removeDeliverableAction(stage.id, index);
      router.refresh();
    });
  }

  function saveNotes() {
    start(async () => {
      await updateStageNotesAction(stage.id, notesValue);
      setShowNotes(false);
      router.refresh();
    });
  }

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} w-72 shrink-0 flex flex-col`}>
      {/* Column header */}
      <div className="p-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <h4 className="text-sm font-semibold text-white">{stage.name}</h4>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
            {STATUS_LABELS[stage.status] ?? stage.status}
          </span>
        </div>
        {stage.completedAt && (
          <div className="text-[10px] text-emerald-300 flex items-center gap-1">
            <Check className="h-2.5 w-2.5" />
            Concluído em {new Date(stage.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 flex-1">
        {/* Assigned team */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wide flex items-center gap-1">
              <Users className="h-3 w-3" /> Equipe ({assignedUsers.length})
            </span>
            <button
              onClick={() => setShowTeamPicker(!showTeamPicker)}
              className="text-[10px] text-violet-300 hover:text-violet-200"
            >
              {showTeamPicker ? "Fechar" : "Atribuir"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {assignedUsers.length === 0 ? (
              <span className="text-[10px] text-[#6b7280]">Ninguém atribuído</span>
            ) : (
              assignedUsers.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center gap-1 rounded-md bg-white/5 border border-white/[0.06] px-1.5 py-0.5"
                  title={u.name}
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-[8px] font-semibold">
                    {initials(u.name)}
                  </div>
                  <span className="text-[10px] text-white">{u.name.split(" ")[0]}</span>
                </div>
              ))
            )}
          </div>

          {showTeamPicker && (
            <div className="mt-2 p-2 rounded-lg border border-white/[0.06] bg-black/20 space-y-1 max-h-40 overflow-y-auto">
              {companyUsers.map((u: any) => {
                const checked = assignedTo.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAssign(u.id)}
                      className="h-3 w-3 rounded border-white/20 bg-white/5 text-violet-500"
                    />
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-[8px] font-semibold">
                      {initials(u.name)}
                    </div>
                    <span className="text-[10px] text-white">{u.name}</span>
                    <span className="text-[9px] text-[#6b7280] ml-auto">{u.jobTitle ?? ""}</span>
                  </label>
                );
              })}
              {companyUsers.length === 0 && (
                <p className="text-[10px] text-[#6b7280] text-center py-2">Nenhum usuário disponível</p>
              )}
            </div>
          )}
        </div>

        {/* Deliverables */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wide flex items-center gap-1">
              <FileText className="h-3 w-3" /> Deliverables ({deliverables.length})
            </span>
            <button
              onClick={() => setShowDeliverableForm(!showDeliverableForm)}
              className="text-[10px] text-violet-300 hover:text-violet-200"
            >
              {showDeliverableForm ? "Fechar" : "+ Adicionar"}
            </button>
          </div>

          {showDeliverableForm && (
            <div className="mb-2 p-2 rounded-lg border border-white/[0.06] bg-black/20 space-y-1.5">
              <input
                value={newDeliverableName}
                onChange={(e) => setNewDeliverableName(e.target.value)}
                placeholder="Nome do deliverable"
                className="w-full h-7 rounded bg-white/5 border border-white/[0.06] px-2 text-[10px] text-white outline-none focus:border-violet-400/50"
              />
              <input
                value={newDeliverableUrl}
                onChange={(e) => setNewDeliverableUrl(e.target.value)}
                placeholder="URL (opcional)"
                className="w-full h-7 rounded bg-white/5 border border-white/[0.06] px-2 text-[10px] text-white outline-none focus:border-violet-400/50"
              />
              <button
                onClick={addDeliverable}
                disabled={pending || !newDeliverableName.trim()}
                className="w-full h-6 rounded bg-violet-500/15 text-violet-300 text-[10px] font-medium hover:bg-violet-500/20 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Adicionar"}
              </button>
            </div>
          )}

          <ul className="space-y-1">
            {deliverables.map((d: any, idx: number) => (
              <li
                key={idx}
                className={`flex items-center gap-1.5 p-1.5 rounded border text-[10px] ${
                  d.completedAt
                    ? "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300"
                    : "border-white/[0.04] bg-white/[0.02] text-[#c4c8d8]"
                }`}
              >
                <button
                  onClick={() => toggleDeliv(idx)}
                  className={`shrink-0 ${d.completedAt ? "text-emerald-400" : "text-[#6b7280]"}`}
                >
                  {d.completedAt ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </button>
                <span className={`flex-1 truncate ${d.completedAt ? "line-through" : ""}`}>
                  {d.name}
                </span>
                {d.url && (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-violet-300 hover:text-violet-200"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                <button
                  onClick={() => removeDeliv(idx)}
                  className="shrink-0 text-[#6b7280] hover:text-red-300"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </li>
            ))}
            {deliverables.length === 0 && (
              <li className="text-[10px] text-[#6b7280] italic">Nenhum deliverable</li>
            )}
          </ul>
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wide flex items-center gap-1">
              <Edit3 className="h-3 w-3" /> Notas
            </span>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-[10px] text-violet-300 hover:text-violet-200"
            >
              {showNotes ? "Fechar" : stage.notes ? "Editar" : "Adicionar"}
            </button>
          </div>
          {showNotes ? (
            <div className="space-y-1.5">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={3}
                placeholder="Notas sobre este estágio..."
                className="w-full rounded bg-white/5 border border-white/[0.06] px-2 py-1 text-[10px] text-white outline-none focus:border-violet-400/50 resize-none"
              />
              <button
                onClick={saveNotes}
                disabled={pending}
                className="w-full h-6 rounded bg-violet-500/15 text-violet-300 text-[10px] font-medium hover:bg-violet-500/20 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Salvar notas"}
              </button>
            </div>
          ) : (
            stage.notes && (
              <p className="text-[10px] text-[#c4c8d8] italic line-clamp-3">{stage.notes}</p>
            )
          )}
        </div>
      </div>

      {/* Footer — status advance button */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={advanceStatus}
          disabled={pending}
          className={`w-full h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
            stage.status === "completed"
              ? "bg-white/5 text-[#8b8fa3] hover:text-white"
              : stage.status === "active"
              ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20"
              : "bg-violet-500/15 text-violet-300 hover:bg-violet-500/20"
          }`}
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin mx-auto" />
          ) : stage.status === "completed" ? (
            "Reabrir estágio"
          ) : stage.status === "active" ? (
            <>
              <Check className="h-3 w-3 inline mr-1" />
              Marcar como concluído
            </>
          ) : (
            <>
              <ChevronRight className="h-3 w-3 inline mr-1" />
              Iniciar estágio
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function ProjectInfo({
  projectId,
  repositoryUrl,
  demoUrl,
  productionUrl,
}: {
  projectId: string;
  repositoryUrl: string | null;
  demoUrl: string | null;
  productionUrl: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [repo, setRepo] = useState(repositoryUrl ?? "");
  const [demo, setDemo] = useState(demoUrl ?? "");
  const [prod, setProd] = useState(productionUrl ?? "");
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      // We'll use a simple approach: update via server action
      // For now, just close editing (the URLs are set on project creation)
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white">Links do projeto</h3>
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-violet-300 hover:text-violet-200"
          >
            Editar
          </button>
        </div>
        <div className="space-y-1.5 text-[10px]">
          {repositoryUrl ? (
            <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
              <Github className="h-3 w-3" /> Repositório
            </a>
          ) : (
            <span className="text-[#6b7280]">Sem repositório</span>
          )}
          {demoUrl ? (
            <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
              <ExternalLink className="h-3 w-3" /> Demo
            </a>
          ) : (
            <span className="text-[#6b7280]">Sem demo</span>
          )}
          {productionUrl ? (
            <a href={productionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200">
              <ExternalLink className="h-3 w-3" /> Produção
            </a>
          ) : (
            <span className="text-[#6b7280]">Sem produção</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-2">
      <h3 className="text-xs font-semibold text-white">Editar links</h3>
      <div>
        <label className="text-[10px] text-[#8b8fa3]">Repositório (URL)</label>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="https://github.com/..."
          className="w-full h-8 rounded bg-white/5 border border-white/[0.06] px-2 text-[10px] text-white outline-none focus:border-violet-400/50"
        />
      </div>
      <div>
        <label className="text-[10px] text-[#8b8fa3]">Demo (URL)</label>
        <input
          value={demo}
          onChange={(e) => setDemo(e.target.value)}
          placeholder="https://demo..."
          className="w-full h-8 rounded bg-white/5 border border-white/[0.06] px-2 text-[10px] text-white outline-none focus:border-violet-400/50"
        />
      </div>
      <div>
        <label className="text-[10px] text-[#8b8fa3]">Produção (URL)</label>
        <input
          value={prod}
          onChange={(e) => setProd(e.target.value)}
          placeholder="https://app..."
          className="w-full h-8 rounded bg-white/5 border border-white/[0.06] px-2 text-[10px] text-white outline-none focus:border-violet-400/50"
        />
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={save}
          disabled={pending}
          className="flex-1 h-7 rounded bg-violet-500/15 text-violet-300 text-[10px] font-medium hover:bg-violet-500/20 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Salvar"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="h-7 px-2 rounded border border-white/10 bg-white/5 text-[10px] text-[#8b8fa3] hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
