"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, X, Power } from "lucide-react";
import { createCompanyAction, toggleCompanyStatusAction } from "@/lib/superadmin-actions";

const PLAN_OPTIONS = [
  { value: "free", label: "Free (5 usuários, 1 filial)" },
  { value: "starter", label: "Starter (20 usuários, 1 filial)" },
  { value: "pro", label: "Pro (50 usuários, 10 filiais)" },
  { value: "enterprise", label: "Enterprise (100 usuários, 20 filiais)" },
];

const COLOR_PRESETS = [
  { primary: "#8b5cf6", secondary: "#6366f1", name: "Violeta" },
  { primary: "#1E3A8A", secondary: "#3B82F6", name: "Azul" },
  { primary: "#059669", secondary: "#10b981", name: "Verde" },
  { primary: "#DC2626", secondary: "#EF4444", name: "Vermelho" },
  { primary: "#EA580C", secondary: "#F97316", name: "Laranja" },
  { primary: "#7C3AED", secondary: "#A855F7", name: "Roxo" },
];

export function CreateCompanyForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [tradeName, setTradeName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [plan, setPlan] = useState("free");
  const [primaryColor, setPrimaryColor] = useState("#8b5cf6");
  const [secondaryColor, setSecondaryColor] = useState("#6366f1");
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!tradeName.trim() || !subdomain.trim()) {
      setError("Nome e subdomínio são obrigatórios");
      return;
    }
    start(async () => {
      const { data, error } = await createCompanyAction({
        tradeName: tradeName.trim(),
        legalName: tradeName.trim(),
        subdomain: subdomain.toLowerCase().trim(),
        plan,
        primaryColor,
        secondaryColor,
        email: email.trim() || undefined,
      });
      if (error) {
        setError(error);
        return;
      }
      setTradeName("");
      setSubdomain("");
      setEmail("");
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
        Criar nova empresa
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Criar nova empresa (tenant)</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-[#8b8fa3] hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome da empresa *</label>
          <input
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            required
            placeholder="Ex: Farmácia Saúde Total"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Subdomínio *</label>
          <div className="flex items-center gap-1">
            <input
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
              required
              placeholder="ex: saudetotal"
              className="flex-1 h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
            <span className="text-xs text-[#6b7280]">.orion-saas-phi.vercel.app</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Plano</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
          >
            {PLAN_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">E-mail do contato</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@empresa.com"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
      </div>

      {/* Color presets */}
      <div>
        <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Cores da marca (White-Label)</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => {
            const active = primaryColor === preset.primary;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => { setPrimaryColor(preset.primary); setSecondaryColor(preset.secondary); }}
                className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  active ? "border-violet-500/40 bg-violet-500/15 text-white" : "border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-0.5">
                  <span className="h-4 w-4 rounded" style={{ backgroundColor: preset.primary }} />
                  <span className="h-4 w-4 rounded" style={{ backgroundColor: preset.secondary }} />
                </div>
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Criar empresa
      </button>
    </form>
  );
}

export function ToggleCompanyButton({
  id,
  active,
  tradeName,
}: {
  id: string;
  active: boolean;
  tradeName: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle() {
    const action = active ? "suspender" : "reativar";
    if (!confirm(`Deseja ${action} a empresa "${tradeName}"? ${active ? "Os usuários não poderão fazer login." : "Os usuários poderão fazer login novamente."}`)) return;
    start(async () => {
      await toggleCompanyStatusAction(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={active ? "Suspender" : "Reativar"}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors disabled:opacity-50 ${
        active
          ? "text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10"
          : "text-[#8b8fa3] hover:text-emerald-300 hover:bg-emerald-500/10"
      }`}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
    </button>
  );
}
