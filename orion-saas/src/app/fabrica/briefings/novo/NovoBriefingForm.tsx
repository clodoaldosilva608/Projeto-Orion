"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, X } from "lucide-react";
import { createBriefingAction } from "@/lib/fabrica-actions";

const PROJECT_TYPES = [
  { value: "", label: "Selecione..." },
  { value: "e-commerce", label: "🛒 E-commerce" },
  { value: "crm", label: "👥 CRM / Gestão de Clientes" },
  { value: "dashboard", label: "📊 Dashboard / Analytics" },
  { value: "blog", label: "✍️ Blog / Portal de Conteúdo" },
  { value: "saas", label: "🚀 Plataforma SaaS" },
  { value: "mobile", label: "📱 App Mobile / PWA" },
  { value: "marketplace", label: "🤝 Marketplace" },
  { value: "landing-page", label: "🌐 Landing Page" },
  { value: "erp", label: "🏢 ERP / Gestão Empresarial" },
  { value: "outro", label: "📦 Outro" },
];

const COMMON_FEATURES = [
  "Login / Autenticação",
  "Painel administrativo",
  "Cadastro de usuários",
  "Pagamentos (Stripe)",
  "Catálogo de produtos",
  "Carrinho de compras",
  "Notificações por email",
  "Notificações push",
  "Relatórios e gráficos",
  "Multi-tenant",
  "API pública",
  "Webhooks",
  "Upload de arquivos",
  "Chat / Suporte",
  "Integração WhatsApp",
  "Multi-idioma",
];

export function NovoBriefingForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectType, setProjectType] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [budgetCents, setBudgetCents] = useState(""); // in BRL (will convert)
  const [timelineWeeks, setTimelineWeeks] = useState("");

  function toggleFeature(f: string) {
    setKeyFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function addCustomFeature() {
    const f = customFeature.trim();
    if (f && !keyFeatures.includes(f)) {
      setKeyFeatures([...keyFeatures, f]);
      setCustomFeature("");
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!clientName.trim() || !clientEmail.trim() || !problemStatement.trim()) {
      setError("Nome do cliente, e-mail e declaração do problema são obrigatórios");
      return;
    }

    start(async () => {
      const { data, error } = await createBriefingAction({
        clientName: clientName.trim(),
        clientCompany: clientCompany.trim() || undefined,
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        projectType: projectType || undefined,
        problemStatement: problemStatement.trim(),
        targetAudience: targetAudience.trim() || undefined,
        keyFeatures,
        successCriteria: successCriteria.trim() || undefined,
        budgetCents: budgetCents ? Math.round(Number(budgetCents) * 100) : undefined,
        timelineWeeks: timelineWeeks ? Number(timelineWeeks) : undefined,
      });
      if (error) {
        setError(error);
        return;
      }
      if (data?.id) {
        router.push(`/fabrica/briefings/${data.id}`);
      } else {
        router.push("/fabrica/briefings");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-5 lg:p-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Cliente */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Dados do Cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
              Nome do cliente *
            </label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="Ex: João Silva"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Empresa</label>
            <input
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              placeholder="Ex: Padaria do João"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">E-mail *</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              placeholder="joao@empresa.com"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Telefone</label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        </div>
      </div>

      {/* Projeto */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Sobre o Projeto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Tipo de projeto</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Prazo desejado (semanas)</label>
            <input
              type="number"
              min="1"
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(e.target.value)}
              placeholder="Ex: 8"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">
            Problema que o projeto deve resolver *
          </label>
          <textarea
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            required
            rows={4}
            placeholder="Ex: Preciso de um sistema para gerenciar pedidos da padaria, hoje tudo é feito em caderno..."
            className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Público-alvo</label>
          <textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            rows={2}
            placeholder="Ex: Donos de padarias e confeitarias de pequeno porte..."
            className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Critérios de sucesso</label>
          <textarea
            value={successCriteria}
            onChange={(e) => setSuccessCriteria(e.target.value)}
            rows={2}
            placeholder="Ex: Reduzir em 50% o tempo de atendimento..."
            className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Orçamento (R$)</label>
          <input
            type="number"
            min="0"
            step="100"
            value={budgetCents}
            onChange={(e) => setBudgetCents(e.target.value)}
            placeholder="Ex: 15000"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Funcionalidades-chave</h3>
        <p className="text-xs text-[#6b7280] mb-3">
          Selecione as features comuns ou adicione customizadas. Quanto mais detalhado, melhor a IA gera o PRD.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_FEATURES.map((f) => {
            const active = keyFeatures.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                    : "border border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white"
                }`}
              >
                {active && <span>✓</span>}
                {f}
              </button>
            );
          })}
        </div>

        {/* Selected custom features */}
        {keyFeatures.filter((f) => !COMMON_FEATURES.includes(f)).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {keyFeatures
              .filter((f) => !COMMON_FEATURES.includes(f))
              .map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className="hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
          </div>
        )}

        {/* Add custom feature */}
        <div className="flex gap-2">
          <input
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomFeature();
              }
            }}
            placeholder="Adicionar feature customizada..."
            className="flex-1 h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
          <button
            type="button"
            onClick={addCustomFeature}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => router.push("/fabrica/briefings")}
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
          Salvar e gerar IA
        </button>
      </div>
    </form>
  );
}
