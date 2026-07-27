"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Plus,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  Tag,
  X,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import {
  createIndicatorAction,
  createCategoryAction,
  deleteIndicatorAction,
  deleteCategoryAction,
} from "@/lib/actions";

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
}

interface Indicator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  unit: string | null;
  formula: string | null;
  direction: string;
  color: string | null;
  icon: string | null;
  isSystem: boolean;
  allowManual: boolean;
  categoryId: string | null;
  category: Category | null;
}

// ---------- DELETE BUTTONS ----------
export function DeleteIndicatorButton({ indicatorId }: { indicatorId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handle = () => {
    if (!confirm("Excluir este indicador?")) return;
    startTransition(async () => {
      const res = await deleteIndicatorAction(indicatorId);
      if (res.error) alert(res.error);
      else router.refresh();
    });
  };
  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      title="Excluir indicador"
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handle = () => {
    if (!confirm("Excluir esta categoria?")) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(categoryId);
      if (res.error) alert(res.error);
      else router.refresh();
    });
  };
  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      title="Excluir categoria"
      className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ---------- SUB-FORM: NOVA CATEGORIA ----------
function NovaCategoriaForm({ onDone }: { onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#8b5cf6",
    icon: "Tag",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Informe o nome da categoria");
      return;
    }
    startTransition(async () => {
      const res = await createCategoryAction({
        name: form.name,
        description: form.description || undefined,
        color: form.color,
        icon: form.icon,
      });
      if (res.error) setError(res.error);
      else onDone();
    });
  };

  const inputClass =
    "w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50 transition-colors";

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FolderPlus className="h-4 w-4 text-violet-300" />
          Nova Categoria
        </h3>
        <button
          type="button"
          onClick={onDone}
          className="text-[#8b8fa3] hover:text-red-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Nome *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Vendas"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Ícone (lucide)
          </label>
          <input
            type="text"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="Ex: DollarSign"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
          Descrição
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição opcional..."
          className={`${inputClass} h-auto min-h-[80px] py-2.5 resize-y`}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
          Cor
        </label>
        <input
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="h-9 w-16 rounded-lg cursor-pointer bg-transparent border border-white/[0.06]"
        />
      </div>

      {error && (
        <div className="glass-card p-3 border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 h-10 text-sm font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg brand-gradient px-5 h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? "Salvando..." : "Salvar Categoria"}
        </button>
      </div>
    </form>
  );
}

// ---------- SUB-FORM: NOVO INDICADOR ----------
function NovoIndicadorForm({
  categories,
  onDone,
}: {
  categories: Category[];
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    unit: "",
    formula: "",
    direction: "higher_is_better",
    color: "#8b5cf6",
    icon: "BarChart3",
    allowManual: true,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Informe o nome do indicador");
      return;
    }
    startTransition(async () => {
      const res = await createIndicatorAction({
        name: form.name,
        description: form.description || undefined,
        unit: form.unit || undefined,
        formula: form.formula || undefined,
        direction: form.direction,
        color: form.color,
        icon: form.icon,
        categoryId: form.categoryId || undefined,
        allowManual: form.allowManual,
      });
      if (res.error) setError(res.error);
      else onDone();
    });
  };

  const inputClass =
    "w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50 transition-colors";

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Plus className="h-4 w-4 text-violet-300" />
          Novo Indicador
        </h3>
        <button
          type="button"
          onClick={onDone}
          className="text-[#8b8fa3] hover:text-red-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Nome *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Vendas Totais"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Categoria
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className={inputClass}
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
          Descrição
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição opcional..."
          className={`${inputClass} h-auto min-h-[80px] py-2.5 resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Unidade
          </label>
          <input
            type="text"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="Ex: R$, %, un"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Direção
          </label>
          <select
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
            className={inputClass}
          >
            <option value="higher_is_better">Maior é melhor</option>
            <option value="lower_is_better">Menor é melhor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Cor
          </label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="h-10 w-full rounded-lg cursor-pointer bg-transparent border border-white/[0.06]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Fórmula
          </label>
          <textarea
            value={form.formula}
            onChange={(e) => setForm({ ...form, formula: e.target.value })}
            placeholder="Ex: (vendas / visitas) * 100"
            className={`${inputClass} h-auto min-h-[80px] py-2.5 resize-y`}
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              Ícone (lucide)
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="Ex: DollarSign"
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#8b8fa3]">
            <input
              type="checkbox"
              checked={form.allowManual}
              onChange={(e) =>
                setForm({ ...form, allowManual: e.target.checked })
              }
              className="w-4 h-4 accent-violet-500"
            />
            Permitir lançamento manual
          </label>
        </div>
      </div>

      {error && (
        <div className="glass-card p-3 border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 h-10 text-sm font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg brand-gradient px-5 h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? "Salvando..." : "Salvar Indicador"}
        </button>
      </div>
    </form>
  );
}

// ---------- MAIN CLIENT COMPONENT ----------
export function IndicadoresClient({
  categories,
  indicators,
}: {
  categories: Category[];
  indicators: Indicator[];
}) {
  const [showIndicatorForm, setShowIndicatorForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const totalIndicators = indicators.length;
  const totalCategories = categories.length;
  const manualCount = indicators.filter((i) => i.allowManual).length;
  const systemCount = indicators.filter((i) => i.isSystem).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            l: "Indicadores",
            v: totalIndicators,
            c: `${totalCategories} categorias`,
          },
          { l: "Categorias", v: totalCategories, c: "Agrupamentos ativos" },
          { l: "Lançamento manual", v: manualCount, c: "Permite input" },
          { l: "Sistema", v: systemCount, c: "Pré-cadastrados" },
        ].map((s) => (
          <div key={s.l} className="glass-card glass-card-hover p-5">
            <p className="text-sm text-[#8b8fa3]">{s.l}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
            <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
          </div>
        ))}
      </div>

      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">
            Categorias &amp; Indicadores
          </h2>
          <span className="text-xs text-[#6b7280]">
            {totalIndicators} itens
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 h-10 text-sm font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Nova Categoria</span>
          </button>
          <button
            onClick={() => setShowIndicatorForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg brand-gradient px-4 h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Indicador</span>
          </button>
        </div>
      </div>

      {/* Forms */}
      {showCategoryForm && (
        <NovaCategoriaForm onDone={() => setShowCategoryForm(false)} />
      )}
      {showIndicatorForm && (
        <NovoIndicadorForm
          categories={categories}
          onDone={() => setShowIndicatorForm(false)}
        />
      )}

      {/* Categories chips */}
      <div className="glass-card p-5 lg:p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4 text-violet-300" />
          Categorias
        </h3>
        {categories.length === 0 ? (
          <p className="text-sm text-[#8b8fa3]">
            Nenhuma categoria cadastrada.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = indicators.filter(
                (i) => i.categoryId === cat.id,
              ).length;
              return (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 pl-3 pr-1.5 py-1.5"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: cat.color || "#8b5cf6" }}
                  />
                  <span className="text-sm text-white font-medium">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-[#6b7280] bg-white/5 rounded px-1.5 py-0.5">
                    {count}
                  </span>
                  <DeleteCategoryButton categoryId={cat.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Indicators table */}
      <div className="glass-card p-5 lg:p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-fuchsia-300" />
          Indicadores
        </h3>

        {indicators.length === 0 ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 bg-white/5">
              <BarChart3 className="h-7 w-7 text-[#6b7280]" />
            </div>
            <p className="text-sm text-[#8b8fa3]">
              Nenhum indicador cadastrado. Clique em &quot;Novo Indicador&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Nome</th>
                  <th className="font-medium px-2 pb-3">Slug</th>
                  <th className="font-medium px-2 pb-3">Unidade</th>
                  <th className="font-medium px-2 pb-3">Categoria</th>
                  <th className="font-medium px-2 pb-3">Direção</th>
                  <th className="font-medium px-2 pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {indicators.map((ind) => (
                  <tr key={ind.id} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: ind.color
                              ? `${ind.color}22`
                              : "rgba(255,255,255,0.05)",
                            border: ind.color
                              ? `1px solid ${ind.color}55`
                              : "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <BarChart3
                            className="h-4 w-4"
                            style={{
                              color: ind.color || "#6b7280",
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                            {ind.name}
                          </p>
                          {ind.description && (
                            <p className="text-xs text-[#6b7280] truncate max-w-[200px]">
                              {ind.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <code className="text-xs text-[#8b8fa3] font-mono">
                        {ind.slug}
                      </code>
                    </td>
                    <td className="px-2 py-3">
                      {ind.unit ? (
                        <span className="text-sm text-white">
                          {ind.unit}
                        </span>
                      ) : (
                        <span className="text-sm text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {ind.category ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-white">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{
                              background: ind.category.color || "#8b5cf6",
                            }}
                          />
                          {ind.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-white">
                        {ind.direction === "higher_is_better" ? (
                          <>
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                            Maior
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 text-sky-400" />
                            Menor
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {ind.isSystem && (
                          <span className="inline-flex rounded-md bg-sky-500/15 text-sky-300 px-2 py-1 text-[10px] font-semibold">
                            Sistema
                          </span>
                        )}
                        <DeleteIndicatorButton indicatorId={ind.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
