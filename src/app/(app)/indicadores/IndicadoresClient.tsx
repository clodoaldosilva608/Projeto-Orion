'use client'

import { useState, useTransition } from 'react'
import {
  BarChart3,
  Plus,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  Tag,
  X,
  Save,
} from 'lucide-react'
import { createIndicatorAction, createCategoryAction } from '@/modules/indicators/services/indicators.actions'
import { DeleteIndicatorButton } from './DeleteIndicatorButton'
import { DeleteCategoryButton } from './DeleteCategoryButton'

// ---------- TIPOS ----------
interface Category {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  sortOrder: number
}

interface Indicator {
  id: string
  name: string
  description: string | null
  unit: string | null
  formula: string | null
  direction: string
  color: string | null
  icon: string | null
  isSystem: boolean
  allowManual: boolean
  categoryId: string | null
  category: Category | null
}

// ---------- SUB-FORM: NOVA CATEGORIA ----------
function NovaCategoriaForm({ onDone }: { onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'Tag'
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('Informe o nome da categoria')
      return
    }
    startTransition(async () => {
      const res = await createCategoryAction({
        name: form.name,
        description: form.description || undefined,
        color: form.color,
        icon: form.icon
      })
      if (res.error) setError(res.error)
      else onDone()
    })
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FolderPlus className="w-4 h-4" style={{ color: 'rgb(var(--orion-indigo))' }} />
          Nova Categoria
        </h3>
        <button type="button" onClick={onDone} className="text-rose-400 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Nome *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Vendas"
            className="orion-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Ícone (lucide)
          </label>
          <input
            type="text"
            value={form.icon}
            onChange={e => setForm({ ...form, icon: e.target.value })}
            placeholder="Ex: DollarSign"
            className="orion-input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Descrição
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição opcional..."
          className="orion-input min-h-[80px] resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Cor
        </label>
        <input
          type="color"
          value={form.color}
          onChange={e => setForm({ ...form, color: e.target.value })}
          className="w-12 h-9 rounded-lg cursor-pointer"
          style={{ background: 'transparent', border: '1px solid rgb(var(--glass-border))' }}
        />
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <p className="text-sm" style={{ color: 'rgb(244 63 94)' }}>{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--glass-border))' }}>
          Cancelar
        </button>
        <button type="submit" disabled={isPending} className="btn-gradient px-6">
          {isPending ? 'Salvando...' : 'Salvar Categoria'}
        </button>
      </div>
    </form>
  )
}

// ---------- SUB-FORM: NOVO INDICADOR ----------
function NovoIndicadorForm({ categories, onDone }: { categories: Category[]; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    unit: '',
    formula: '',
    direction: 'higher_is_better',
    color: '#6366f1',
    icon: 'BarChart3',
    allowManual: true
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('Informe o nome do indicador')
      return
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
        allowManual: form.allowManual
      })
      if (res.error) setError(res.error)
      else onDone()
    })
  }

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0a0c8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundPosition: 'right 12px center'
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Plus className="w-4 h-4" style={{ color: 'rgb(var(--orion-indigo))' }} />
          Novo Indicador
        </h3>
        <button type="button" onClick={onDone} className="text-rose-400 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Nome *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Vendas Totais"
            className="orion-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Categoria
          </label>
          <select
            value={form.categoryId}
            onChange={e => setForm({ ...form, categoryId: e.target.value })}
            className="orion-input appearance-none bg-no-repeat"
            style={selectStyle}
          >
            <option value="">Sem categoria</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Descrição
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição opcional..."
          className="orion-input min-h-[80px] resize-y"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Unidade
          </label>
          <input
            type="text"
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
            placeholder="Ex: R$, %, un"
            className="orion-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Direção
          </label>
          <select
            value={form.direction}
            onChange={e => setForm({ ...form, direction: e.target.value })}
            className="orion-input appearance-none bg-no-repeat"
            style={selectStyle}
          >
            <option value="higher_is_better">Maior é melhor</option>
            <option value="lower_is_better">Menor é melhor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Cor
          </label>
          <input
            type="color"
            value={form.color}
            onChange={e => setForm({ ...form, color: e.target.value })}
            className="w-full h-9 rounded-lg cursor-pointer"
            style={{ background: 'transparent', border: '1px solid rgb(var(--glass-border))' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Fórmula
          </label>
          <textarea
            value={form.formula}
            onChange={e => setForm({ ...form, formula: e.target.value })}
            placeholder="Ex: (vendas / visitas) * 100"
            className="orion-input min-h-[80px] resize-y"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Ícone (lucide)
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })}
              placeholder="Ex: DollarSign"
              className="orion-input"
            />
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            <input
              type="checkbox"
              checked={form.allowManual}
              onChange={e => setForm({ ...form, allowManual: e.target.checked })}
              className="w-4 h-4 accent-indigo-500"
            />
            Permitir lançamento manual de resultados
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <p className="text-sm" style={{ color: 'rgb(244 63 94)' }}>{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--glass-border))' }}>
          Cancelar
        </button>
        <button type="submit" disabled={isPending} className="btn-gradient px-6">
          {isPending ? 'Salvando...' : 'Salvar Indicador'}
        </button>
      </div>
    </form>
  )
}

// ---------- COMPONENTE PRINCIPAL ----------
export function IndicadoresClient({ categories, indicators }: { categories: Category[]; indicators: Indicator[] }) {
  const [showIndicatorForm, setShowIndicatorForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  // Agrupa indicadores por categoria
  const categorized = categories
    .map(cat => ({
      category: cat,
      items: indicators.filter(i => i.categoryId === cat.id)
    }))
    .filter(g => g.items.length > 0)

  const uncategorized = indicators.filter(i => !i.categoryId)

  const renderIndicatorCard = (ind: Indicator, idx: number) => (
    <div
      key={ind.id}
      className="glass-card p-5 hover:shadow-lg transition-all animate-fade-in-up group"
      style={{ animationDelay: `${idx * 0.04}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            style={{ background: ind.color ? `${ind.color}22` : 'rgb(var(--surface-2))', border: ind.color ? `1px solid ${ind.color}55` : '1px solid rgb(var(--glass-border))' }}
          >
            <BarChart3 className="w-5 h-5" style={{ color: ind.color || 'rgb(var(--text-muted))' }} />
          </div>
          <div>
            <h3 className="font-semibold text-white truncate max-w-[160px]" title={ind.name}>{ind.name}</h3>
            {ind.isSystem && (
              <span className="badge badge-info mt-1 uppercase" style={{ fontSize: '10px' }}>Sistema</span>
            )}
          </div>
        </div>
        <DeleteIndicatorButton indicatorId={ind.id} />
      </div>

      {ind.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>{ind.description}</p>
      )}

      <div className="space-y-2 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
        {ind.unit && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            <span>Unidade: {ind.unit}</span>
          </div>
        )}
        {ind.formula && (
          <div className="flex items-start gap-1.5">
            <span className="font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Fórmula:</span>
            <code className="break-words">{ind.formula}</code>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          {ind.direction === 'higher_is_better'
            ? <TrendingUp className="w-3 h-3 text-emerald-400" />
            : <TrendingDown className="w-3 h-3 text-sky-400" />}
          <span>{ind.direction === 'higher_is_better' ? 'Maior é melhor' : 'Menor é melhor'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: ind.color || 'rgb(var(--text-muted))' }}
          />
          <span>{ind.allowManual ? 'Lançamento manual: sim' : 'Lançamento manual: não'}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Indicadores</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Construa e gerencie os KPIs da sua empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryForm(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgb(var(--glass-bg))', color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--glass-border))' }}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
          <button onClick={() => setShowIndicatorForm(v => !v)} className="btn-gradient inline-flex items-center gap-2">
            <Plus className="w-4 h-4 relative z-10" />
            <span>Novo Indicador</span>
          </button>
        </div>
      </div>

      {/* Forms */}
      {showCategoryForm && <NovaCategoriaForm onDone={() => setShowCategoryForm(false)} />}
      {showIndicatorForm && <NovoIndicadorForm categories={categories} onDone={() => setShowIndicatorForm(false)} />}

      {/* Empty State */}
      {indicators.length === 0 && categories.length === 0 && (
        <div className="glass-card p-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgb(var(--surface-2))' }}>
            <BarChart3 className="w-8 h-8" style={{ color: 'rgb(var(--text-muted))' }} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nenhum indicador encontrado</h3>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
            Crie categorias e indicadores para monitorar a performance do seu time de vendas.
          </p>
          <button
            onClick={() => setShowIndicatorForm(true)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgb(var(--orion-indigo) / 0.15)', color: 'rgb(var(--orion-indigo))', border: '1px solid rgb(var(--orion-indigo) / 0.3)' }}
          >
            Criar Indicador
          </button>
        </div>
      )}

      {/* Categorias e seus indicadores */}
      {categorized.map(group => (
        <div key={group.category.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: group.category.color || 'rgb(var(--orion-indigo))' }}
              />
              <h2 className="text-lg font-semibold text-white">{group.category.name}</h2>
              <span className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                ({group.items.length})
              </span>
            </div>
            <DeleteCategoryButton categoryId={group.category.id} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {group.items.map((ind, i) => renderIndicatorCard(ind, i))}
          </div>
        </div>
      ))}

      {/* Sem categoria */}
      {uncategorized.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Sem categoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {uncategorized.map((ind, i) => renderIndicatorCard(ind, i))}
          </div>
        </div>
      )}
    </div>
  )
}
