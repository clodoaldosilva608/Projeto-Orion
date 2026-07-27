"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, X, Trash2 } from "lucide-react";
import { createTemplateAction, deleteTemplateAction } from "@/lib/checklist-actions";

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Seg" },
  { value: "2", label: "Ter" },
  { value: "3", label: "Qua" },
  { value: "4", label: "Qui" },
  { value: "5", label: "Sex" },
  { value: "6", label: "Sáb" },
  { value: "7", label: "Dom" },
];

const SCOPE_OPTIONS = [
  { value: "personal", label: "Pessoal (só eu)" },
  { value: "role", label: "Por cargo" },
  { value: "team", label: "Equipe" },
  { value: "company", label: "Toda empresa" },
];

export function NewTemplateForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("personal");
  const [startsAt, setStartsAt] = useState("09:00");
  const [endsAt, setEndsAt] = useState("18:00");
  const [weekdays, setWeekdays] = useState<string[]>(["1", "2", "3", "4", "5"]);
  const [items, setItems] = useState<Array<{
    title: string;
    points: number;
    isRequired: boolean;
    estimatedMin: string;
  }>>([
    { title: "", points: 10, isRequired: true, estimatedMin: "" },
  ]);

  function toggleWeekday(value: string) {
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort()
    );
  }

  function addItem() {
    setItems([...items, { title: "", points: 10, isRequired: true, estimatedMin: "" }]);
  }
  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }
  function updateItem(idx: number, field: string, value: any) {
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    const validItems = items.filter((it) => it.title.trim());
    if (validItems.length === 0) {
      setError("Adicione pelo menos 1 item com título");
      return;
    }
    if (weekdays.length === 0) {
      setError("Selecione pelo menos 1 dia da semana");
      return;
    }

    start(async () => {
      const { error } = await createTemplateAction({
        name: name.trim(),
        description: description.trim() || undefined,
        scope: scope as any,
        startsAt,
        endsAt,
        weekdays: weekdays.join(","),
        items: validItems.map((it) => ({
          title: it.title.trim(),
          points: Number(it.points) || 10,
          isRequired: it.isRequired,
          estimatedMin: it.estimatedMin ? Number(it.estimatedMin) : undefined,
        })),
      });
      if (error) {
        setError(error);
        return;
      }
      // Reset form
      setName("");
      setDescription("");
      setItems([{ title: "", points: 10, isRequired: true, estimatedMin: "" }]);
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
        Criar novo modelo
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card p-5 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Novo modelo de checklist</h3>
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

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Rotina matinal de vendas"
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
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Escopo</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
          >
            {SCOPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Início</label>
            <input
              type="time"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Fim</label>
            <input
              type="time"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        </div>
      </div>

      {/* Weekdays */}
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Dias da semana</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_OPTIONS.map((d) => {
            const active = weekdays.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleWeekday(d.value)}
                className={`inline-flex items-center justify-center h-9 w-12 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                    : "border border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Itens do checklist *</label>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 flex-wrap">
              <input
                value={item.title}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                placeholder={`Tarefa ${idx + 1}`}
                className="flex-1 min-w-[180px] h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
              />
              <input
                type="number"
                value={item.points}
                onChange={(e) => updateItem(idx, "points", e.target.value)}
                title="Pontos ao concluir"
                className="w-16 h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
              />
              <input
                type="number"
                value={item.estimatedMin}
                onChange={(e) => updateItem(idx, "estimatedMin", e.target.value)}
                placeholder="min"
                title="Minutos estimados (opcional)"
                className="w-16 h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
              />
              <label className="inline-flex items-center gap-1 text-xs text-[#8b8fa3] cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isRequired}
                  onChange={(e) => updateItem(idx, "isRequired", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-violet-500"
                />
                Obrig.
              </label>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
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
          onClick={addItem}
          className="mt-2 inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200"
        >
          <Plus className="h-3 w-3" /> Adicionar item
        </button>
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
          Salvar modelo
        </button>
      </div>
    </form>
  );
}

export function DeleteTemplateButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm(`Excluir o modelo "${name}"? As tarefas já geradas não serão afetadas.`)) return;
    start(async () => {
      await deleteTemplateAction(id);
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      title="Excluir modelo"
      className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
