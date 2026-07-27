"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, X, Play, Pause, Square, Trash2, Settings2 } from "lucide-react";
import {
  createFeedbackAction,
  updateFeedbackStatusAction,
  deleteFeedbackAction,
} from "@/lib/feedback-actions";

const TYPE_OPTIONS = [
  { value: "rating", label: "⭐ Avaliação (1-5 estrelas)" },
  { value: "nps", label: "📊 NPS (0-10 — recomendaria?)" },
  { value: "csat", label: "😊 CSAT (1-5 — satisfação)" },
  { value: "ces", label: "⚡ CES (1-7 — facilidade)" },
  { value: "open", label: "✍️ Resposta aberta" },
  { value: "multiple_choice", label: "📋 Múltipla escolha" },
];

export function NewFeedbackForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("rating");
  const [question, setQuestion] = useState("");
  const [helpText, setHelpText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [pointsReward, setPointsReward] = useState(5);
  const [status, setStatus] = useState<"draft" | "active">("draft");

  function addOption() {
    setOptions([...options, ""]);
  }
  function removeOption(idx: number) {
    setOptions(options.filter((_, i) => i !== idx));
  }
  function updateOption(idx: number, value: string) {
    setOptions(options.map((o, i) => (i === idx ? value : o)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !question.trim()) {
      setError("Título e pergunta são obrigatórios");
      return;
    }
    const validOptions = type === "multiple_choice" ? options.filter((o) => o.trim()) : [];
    if (type === "multiple_choice" && validOptions.length < 2) {
      setError("Múltipla escolha requer pelo menos 2 opções");
      return;
    }

    start(async () => {
      const { error } = await createFeedbackAction({
        title: title.trim(),
        description: description.trim() || undefined,
        type: type as any,
        question: question.trim(),
        helpText: helpText.trim() || undefined,
        options: type === "multiple_choice" ? validOptions : undefined,
        isAnonymous,
        pointsReward,
        status,
      });
      if (error) {
        setError(error);
        return;
      }
      // Reset
      setTitle("");
      setDescription("");
      setQuestion("");
      setHelpText("");
      setOptions(["", ""]);
      setShowForm(false);
      router.refresh();
    });
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95"
      >
        <Plus className="h-4 w-4" />
        Criar nova pesquisa
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card p-5 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Nova pesquisa de feedback</h3>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-[#8b8fa3] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Título *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: Pesquisa de satisfação mensal"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Pontos por resposta</label>
          <input
            type="number"
            min="0"
            max="100"
            value={pointsReward}
            onChange={(e) => setPointsReward(Number(e.target.value))}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Pergunta *</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            rows={2}
            placeholder="Ex: Quão satisfeito você está com a plataforma?"
            className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Texto de ajuda (opcional)</label>
          <input
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            placeholder="Ex: Considere os últimos 30 dias"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
      </div>

      {/* Multiple choice options */}
      {type === "multiple_choice" && (
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Opções *</label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Opção ${idx + 1}`}
                  className="flex-1 h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#8b8fa3] hover:text-red-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200"
          >
            <Plus className="h-3 w-3" /> Adicionar opção
          </button>
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500"
          />
          <span className="text-sm text-[#c4c8d8]">Respostas anônimas</span>
        </label>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Status inicial</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
          >
            <option value="draft">Rascunho (não visível para usuários)</option>
            <option value="active">Ativa (disponível imediatamente)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#8b8fa3] hover:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Criar pesquisa
        </button>
      </div>
    </form>
  );
}

export function StatusButtons({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();

  function update(s: "draft" | "active" | "paused" | "closed") {
    start(async () => {
      await updateFeedbackStatusAction(id, s);
    });
  }
  function remove() {
    if (!confirm("Excluir esta pesquisa? Todas as respostas serão mantidas mas a pesquisa ficará indisponível.")) return;
    start(async () => {
      await deleteFeedbackAction(id);
    });
  }

  return (
    <div className="inline-flex items-center gap-1">
      {status === "draft" && (
        <button
          onClick={() => update("active")}
          disabled={pending}
          title="Ativar"
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-emerald-300 hover:bg-emerald-500/10"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      )}
      {status === "active" && (
        <>
          <button
            onClick={() => update("paused")}
            disabled={pending}
            title="Pausar"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-amber-300 hover:bg-amber-500/10"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => update("closed")}
            disabled={pending}
            title="Encerrar"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-sky-300 hover:bg-sky-500/10"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
          </button>
        </>
      )}
      {status === "paused" && (
        <button
          onClick={() => update("active")}
          disabled={pending}
          title="Reativar"
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-emerald-300 hover:bg-emerald-500/10"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      )}
      <button
        onClick={remove}
        disabled={pending}
        title="Excluir"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
