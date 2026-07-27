"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, Sparkles, Copy } from "lucide-react";
import {
  generateIaBriefingAction,
  approveBriefingAction,
  rejectBriefingAction,
} from "@/lib/fabrica-actions";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export function GenerateIaButton({ briefingId }: { briefingId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function generate() {
    if (!confirm("Gerar PRD + arquitetura + estimativas via IA? Isso pode levar 10-20 segundos.")) return;
    start(async () => {
      const { error } = await generateIaBriefingAction(briefingId);
      if (error) {
        alert("Erro: " + error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      onClick={generate}
      disabled={pending}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {pending ? "IA processando..." : "Gerar via IA"}
    </button>
  );
}

export function ApproveBriefingForm({
  briefingId,
  templates,
}: {
  briefingId: string;
  templates: any[];
}) {
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function approve() {
    setError(null);
    if (!projectName.trim()) {
      setError("Nome do projeto é obrigatório");
      return;
    }
    start(async () => {
      const { data, error } = await approveBriefingAction(briefingId, {
        projectName: projectName.trim(),
        templateId: templateId || undefined,
      });
      if (error) {
        setError(error);
        return;
      }
      if (data?.projectId) {
        router.push("/fabrica/projetos");
      }
    });
  }

  if (!showForm) {
    return (
      <div className="glass-card p-5 border-emerald-500/30">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">Aprovar briefing e criar projeto</h3>
            <p className="text-xs text-[#8b8fa3] mb-3">
              Revise o PRD e arquitetura gerados pela IA. Se estiver OK, aprove
              para criar o projeto automaticamente com pipeline padrão.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20"
              >
                <Check className="h-3.5 w-3.5" /> Aprovar e criar projeto
              </button>
              <RejectBriefingButton briefingId={briefingId} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 border-emerald-500/30 space-y-3">
      <h3 className="text-sm font-semibold text-white">Aprovar briefing</h3>
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome do projeto *</label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Ex: Padaria do João - Sistema de Pedidos"
          className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Template (opcional)</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
        >
          <option value="">Sem template</option>
          {templates.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.iconEmoji} {t.displayName}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={approve}
          disabled={pending}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Confirmar criação
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#8b8fa3] hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function RejectBriefingButton({ briefingId }: { briefingId: string }) {
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState("");
  const router = useRouter();

  function reject() {
    if (!notes.trim()) {
      alert("Informe o motivo da rejeição");
      return;
    }
    start(async () => {
      const { error } = await rejectBriefingAction(briefingId, notes.trim());
      if (error) {
        alert("Erro: " + error);
        return;
      }
      router.refresh();
    });
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-medium text-red-300 hover:bg-red-500/10"
      >
        <X className="h-3.5 w-3.5" /> Rejeitar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
      <div className="glass-card p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-white">Rejeitar briefing</h3>
        <p className="text-xs text-[#8b8fa3]">Informe o motivo da rejeição:</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ex: Escopo muito amplo para o orçamento..."
          className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={reject}
            disabled={pending}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-red-500/15 text-red-300 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Confirmar rejeição
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#8b8fa3] hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
