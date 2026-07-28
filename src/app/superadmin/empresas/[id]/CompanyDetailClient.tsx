"use client";

import { useState, useTransition } from "react";
import {
  Clock, Ban, CheckCircle, RefreshCw, Loader2, AlertTriangle,
  Calendar, CreditCard, Users, Building2, Activity, Settings
} from "lucide-react";
import {
  extendTrialAction, cancelCompanyAction, activateManuallyAction, resetTrialAction,
  toggleCompanyStatusAction,
} from "@/lib/superadmin-actions";

type Company = {
  id: string;
  tradeName: string;
  legalName: string;
  subdomain: string | null;
  appName: string;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  plan: string;
  active: boolean;
  primaryColor: string;
  createdAt: Date;
  license: {
    id: string;
    plan: string;
    status: string;
    active: boolean;
    startDate: Date;
    expirationDate: Date;
    trialEndsAt: Date | null;
    maxUsers: number;
    maxBranches: number;
    metadata: any;
  } | null;
  _count: { users: number; branches: number; indicators: number; goals: number; softwareProjects: number };
  users: any[];
  branches: any[];
  auditLogs: any[];
  enabledModules: any[];
};

export function CompanyDetailClient({ company }: { company: Company }) {
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<null | "extend" | "cancel" | "activate" | "reset" | "toggle">(null);
  const [extendDays, setExtendDays] = useState("7");
  const [cancelReason, setCancelReason] = useState("");
  const [activatePlan, setActivatePlan] = useState("pro");
  const [activateExpires, setActivateExpires] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const lic = company.license;
  const now = new Date();
  const trialEnded = lic?.trialEndsAt ? lic.trialEndsAt < now : false;
  const trialDaysLeft = lic?.trialEndsAt ? Math.ceil((lic.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const run = (fn: () => Promise<{ error?: string | null }>, successMsg: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) {
        setFeedback({ ok: false, msg: res.error });
      } else {
        setFeedback({ ok: true, msg: successMsg });
        setModal(null);
      }
    });
  };

  const avatarBg = { background: "linear-gradient(135deg, " + company.primaryColor + ", " + company.primaryColor + "cc)" } as React.CSSProperties;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl font-bold text-white text-xl" style={avatarBg}>
            {company.tradeName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">{company.tradeName}</h1>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${company.active ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${company.active ? "bg-emerald-400" : "bg-red-400"}`} />
                {company.active ? "Ativa" : "Suspensa"}
              </span>
              {lic && (
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  lic.status === "trial" ? "bg-violet-500/15 text-violet-300" :
                  lic.status === "active" ? "bg-emerald-500/15 text-emerald-300" :
                  lic.status === "canceled" ? "bg-red-500/15 text-red-300" :
                  "bg-amber-500/15 text-amber-300"
                }`}>
                  {lic.status === "trial" ? `Trial ${trialDaysLeft > 0 ? `(${trialDaysLeft}d)` : "expirado"}` : lic.status}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8b8fa3] mt-1">
              {company.appName} · {company.subdomain ? `${company.subdomain}.orion-saas-platform.vercel.app` : "Sem subdomínio"}
            </p>
            <p className="text-[10px] text-[#6b7280] mt-0.5">
              CNPJ: {company.cnpj || "—"} · Email: {company.email || "—"} · Criada em {new Date(company.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
          <button onClick={() => setModal("extend")} disabled={isPending}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-violet-500/15 border border-violet-500/30 text-[11px] font-semibold text-violet-200 hover:bg-violet-500/25">
            <Clock className="h-3.5 w-3.5" /> Prorrogar trial
          </button>
          <button onClick={() => setModal("activate")} disabled={isPending}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/25">
            <CheckCircle className="h-3.5 w-3.5" /> Ativar manualmente
          </button>
          <button onClick={() => setModal("reset")} disabled={isPending}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-500/15 border border-blue-500/30 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/25">
            <RefreshCw className="h-3.5 w-3.5" /> Resetar trial
          </button>
          <button onClick={() => setModal("toggle")} disabled={isPending}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/25">
            <Settings className="h-3.5 w-3.5" /> {company.active ? "Suspender" : "Reativar"}
          </button>
          <button onClick={() => setModal("cancel")} disabled={isPending}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-[11px] font-semibold text-red-200 hover:bg-red-500/25">
            <Ban className="h-3.5 w-3.5" /> Cancelar definitivamente
          </button>
        </div>

        {feedback && (
          <div className={`mt-3 text-xs rounded-md px-3 py-2 ${feedback.ok ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"}`}>
            {feedback.ok ? "✓ " : "✗ "}{feedback.msg}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={<Users className="h-4 w-4" />} label="Usuários" value={company._count.users} color="#3b82f6" />
        <StatCard icon={<Building2 className="h-4 w-4" />} label="Filiais" value={company._count.branches} color="#10b981" />
        <StatCard icon={<Activity className="h-4 w-4" />} label="Indicadores" value={company._count.indicators} color="#f59e0b" />
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Metas" value={company._count.goals} color="#ec4899" />
        <StatCard icon={<Settings className="h-4 w-4" />} label="Projetos" value={company._count.softwareProjects} color="#8b5cf6" />
      </div>

      {/* License details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* License */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-violet-300" /> Licença
          </h3>
          {lic ? (
            <div className="space-y-2 text-xs">
              <Row label="Status" value={lic.status} highlight={lic.status} />
              <Row label="Plano" value={lic.plan} />
              <Row label="Max usuários" value={lic.maxUsers} />
              <Row label="Max filiais" value={lic.maxBranches} />
              <Row label="Início" value={new Date(lic.startDate).toLocaleDateString("pt-BR")} />
              <Row label="Expira em" value={new Date(lic.expirationDate).toLocaleDateString("pt-BR")} />
              {lic.trialEndsAt && (
                <Row label="Trial até" value={new Date(lic.trialEndsAt).toLocaleDateString("pt-BR")} highlight={trialEnded ? "expired" : "trial"} />
              )}
            </div>
          ) : (
            <p className="text-xs text-[#8b8fa3]">Sem licença. Use "Ativar manualmente".</p>
          )}
        </div>

        {/* Audit log */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-300" /> Histórico de ações
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {company.auditLogs.length === 0 ? (
              <p className="text-xs text-[#8b8fa3]">Nenhuma ação registrada.</p>
            ) : (
              company.auditLogs.map((log) => (
                <div key={log.id} className="text-[11px] border-l-2 border-violet-500/40 pl-2 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{log.action} · {log.tableName}</span>
                    <span className="text-[10px] text-[#6b7280]">{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  {log.newValue && (
                    <pre className="text-[9px] text-[#8b8fa3] mt-0.5 overflow-x-auto">{JSON.stringify(log.newValue).substring(0, 150)}</pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {modal === "extend" && (
        <Modal title="Prorrogar trial" onClose={() => setModal(null)}>
          <p className="text-xs text-[#8b8fa3] mb-3">Quantos dias adicionar ao trial atual?</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setExtendDays(String(d))}
                className={"h-9 rounded-lg text-xs font-semibold " + (extendDays === String(d) ? "brand-gradient text-white" : "border border-white/10 bg-white/5 text-[#c4c8d8]")}
              >
                +{d}d
              </button>
            ))}
          </div>
          <input type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} min={1} max={365}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white mb-3" />
          <button onClick={() => run(() => extendTrialAction(company.id, parseInt(extendDays)), "Trial prorrogado por " + extendDays + " dias")} disabled={isPending}
            className="w-full h-10 rounded-lg brand-gradient text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
            Prorrogar {extendDays} dias
          </button>
        </Modal>
      )}

      {modal === "cancel" && (
        <Modal title="⚠️ Cancelar assinatura" onClose={() => setModal(null)}>
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 mb-3">
            <p className="text-xs text-red-200">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Esta ação é <strong>irreversível</strong>. Cancelará no Stripe e suspenderá a empresa.
            </p>
          </div>
          <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} type="text" placeholder="Motivo (opcional)"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white mb-3" />
          <button onClick={() => run(() => cancelCompanyAction(company.id, cancelReason), "Assinatura cancelada")} disabled={isPending}
            className="w-full h-10 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 hover:bg-red-500/30">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            Confirmar cancelamento
          </button>
        </Modal>
      )}

      {modal === "activate" && (
        <Modal title="Ativar manualmente" onClose={() => setModal(null)}>
          <p className="text-xs text-[#8b8fa3] mb-3">Ativa sem Stripe — para PIX, boleto ou cortesia.</p>
          <label className="block text-[10px] text-[#8b8fa3] uppercase tracking-wide mb-1">Plano</label>
          <select value={activatePlan} onChange={(e) => setActivatePlan(e.target.value)}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white mb-3">
            <option value="free">Free</option>
            <option value="starter">Starter (R$ 99/mês)</option>
            <option value="pro">Pro (R$ 299/mês)</option>
            <option value="enterprise">Enterprise (R$ 499/mês)</option>
          </select>
          <label className="block text-[10px] text-[#8b8fa3] uppercase tracking-wide mb-1">Expira em (opcional)</label>
          <input type="date" value={activateExpires} onChange={(e) => setActivateExpires(e.target.value)}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white mb-3" />
          <button onClick={() => run(() => activateManuallyAction(company.id, activatePlan, activateExpires || undefined), "Conta ativada manualmente")} disabled={isPending}
            className="w-full h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 hover:bg-emerald-500/30">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Ativar conta
          </button>
        </Modal>
      )}

      {modal === "reset" && (
        <Modal title="Resetar trial" onClose={() => setModal(null)}>
          <p className="text-xs text-[#8b8fa3] mb-3">Recomeça o trial de 14 dias. Status volta para <code className="text-violet-300">trial</code> e plano para <code className="text-violet-300">free</code>.</p>
          <button onClick={() => run(() => resetTrialAction(company.id), "Trial resetado para 14 dias")} disabled={isPending}
            className="w-full h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-200 text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 hover:bg-blue-500/30">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Confirmar reset
          </button>
        </Modal>
      )}

      {modal === "toggle" && (
        <Modal title={company.active ? "Suspender empresa" : "Reativar empresa"} onClose={() => setModal(null)}>
          <p className="text-xs text-[#8b8fa3] mb-3">
            {company.active
              ? "Empresa será suspensa. Usuários não conseguirão acessar o dashboard."
              : "Empresa será reativada. Usuários voltam a ter acesso (se licença estiver ativa)."}
          </p>
          <button
            onClick={() => run(() => toggleCompanyStatusAction(company.id), company.active ? "Empresa suspensa" : "Empresa reativada")}
            disabled={isPending}
            className={
              "w-full h-10 rounded-lg text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 " +
              (company.active
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30"
                : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30")
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Confirmar
          </button>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const borderStyle = { borderColor: color + "33" } as React.CSSProperties;
  return (
    <div className="glass-card p-3" style={borderStyle}>
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="text-lg font-bold text-white mt-1">{value}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: any; highlight?: string }) {
  const colors: Record<string, string> = {
    trial: "text-violet-300",
    active: "text-emerald-300",
    canceled: "text-red-300",
    suspended: "text-amber-300",
    expired: "text-red-300",
  };
  const colorClass = highlight ? colors[highlight] || "text-white" : "text-white";
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#8b8fa3]">{label}</span>
      <span className={"font-medium " + colorClass}>{value}</span>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-[#8b8fa3] hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
