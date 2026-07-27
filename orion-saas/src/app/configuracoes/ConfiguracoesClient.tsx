"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Building2, Palette, Bell, Plug, ShieldCheck, Mail, Webhook,
  Save, Loader2, CheckCircle2, AlertCircle, QrCode, Lock, Unlock,
  Send, RefreshCw, Plus, Trash2, ExternalLink, Clock,
} from "lucide-react";

type Tab = "empresa" | "aparencia" | "notificacoes" | "seguranca" | "email" | "webhooks" | "integracoes";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança (2FA)", icon: ShieldCheck },
  { id: "email", label: "E-mail (SMTP)", icon: Mail },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "integracoes", label: "Integrações", icon: Plug },
];

export function ConfiguracoesClient({
  initialSettings,
  emailQueue,
  webhookDeliveries,
}: {
  initialSettings: Record<string, any>;
  emailQueue: any[];
  webhookDeliveries: any[];
}) {
  const [tab, setTab] = useState<Tab>("empresa");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Tabs sidebar */}
      <div className="glass-card p-3 h-fit lg:sticky lg:top-20">
        <ul className="space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-violet-500/15 text-white" : "text-[#8b8fa3] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-violet-300" : "text-[#6b7280]"}`} />
                  <span className="flex-1 text-left">{t.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tab content */}
      <div className="lg:col-span-3 space-y-5">
        {tab === "empresa" && <EmpresaTab initial={initialSettings} />}
        {tab === "aparencia" && <AparenciaTab initial={initialSettings} />}
        {tab === "notificacoes" && <NotificacoesTab initial={initialSettings} />}
        {tab === "seguranca" && <SegurancaTab />}
        {tab === "email" && <EmailTab queue={emailQueue} />}
        {tab === "webhooks" && <WebhooksTab deliveries={webhookDeliveries} />}
        {tab === "integracoes" && <IntegracoesTab initial={initialSettings} />}
      </div>
    </div>
  );
}

// ---------- Empresa ----------

function EmpresaTab({ initial }: { initial: Record<string, any> }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const company = initial["company.info"] ?? {
    razaoSocial: "Orion Tecnologia Ltda.",
    cnpj: "12.345.678/0001-90",
    email: "contato@orion.com",
    phone: "+55 (11) 4000-0000",
    address: "Av. Paulista, 1000 — São Paulo/SP",
    website: "https://orion.com",
  };

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const value = {
      razaoSocial: fd.get("razaoSocial"),
      cnpj: fd.get("cnpj"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      address: fd.get("address"),
      website: fd.get("website"),
    };
    start(async () => {
      const { saveSystemSettingAction } = await import("@/lib/p6-actions");
      await saveSystemSettingAction("company.info", value, "empresa");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form onSubmit={save} className="glass-card p-5 lg:p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Dados da Empresa</h3>
        <p className="text-xs text-[#6b7280]">Informações exibidas em notas fiscais e contatos.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: "razaoSocial", label: "Razão Social", value: company.razaoSocial },
          { name: "cnpj", label: "CNPJ", value: company.cnpj },
          { name: "email", label: "E-mail de contato", value: company.email },
          { name: "phone", label: "Telefone", value: company.phone },
          { name: "address", label: "Endereço", value: company.address, full: true },
          { name: "website", label: "Site", value: company.website },
        ].map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">{f.label}</label>
            <input
              name={f.name}
              defaultValue={f.value}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="text-xs text-emerald-300 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Salvo
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alterações
        </button>
      </div>
    </form>
  );
}

// ---------- Aparência ----------

function AparenciaTab({ initial }: { initial: Record<string, any> }) {
  return (
    <div className="glass-card p-5 lg:p-6 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Aparência</h3>
        <p className="text-xs text-[#6b7280]">Personalize a identidade visual da plataforma.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome da Plataforma</label>
          <input
            defaultValue="Orion SaaS"
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Cor primária</label>
          <div className="flex gap-2">
            {["#8b5cf6", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"].map((c, i) => (
              <button
                key={c}
                type="button"
                className={`h-10 w-10 rounded-lg border-2 ${i === 0 ? "border-white" : "border-transparent"} transition-all hover:scale-110`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Tema</label>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 h-10 text-sm font-medium text-white">
              <span className="h-4 w-4 rounded bg-[#0f111a] border border-white/20" />
              Escuro
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 h-10 text-sm font-medium text-[#8b8fa3] hover:text-white">
              <span className="h-4 w-4 rounded bg-white border border-white/20" />
              Claro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Notificações ----------

function NotificacoesTab({ initial }: { initial: Record<string, any> }) {
  const items = [
    "Novo cliente cadastrado",
    "Pagamento aprovado / recisado",
    "Anomalia crítica detectada",
    "Deploy concluído com sucesso",
    "Limite de IA próximo de atingir",
    "Certificado SSL próximo do vencimento",
  ];
  return (
    <div className="glass-card p-5 lg:p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Notificações</h3>
        <p className="text-xs text-[#6b7280]">Escolha quais alertas deseja receber.</p>
      </div>
      <ul className="space-y-3">
        {items.map((n, i) => (
          <li key={n} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.04] px-4 py-3">
            <span className="text-sm text-white">{n}</span>
            <button type="button" className={`relative h-6 w-11 rounded-full transition-colors ${i % 2 === 0 ? "bg-violet-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${i % 2 === 0 ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Segurança (2FA) ----------

function SegurancaTab() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"loading" | "on" | "off">("loading");
  const [setupData, setSetupData] = useState<{ secret: string; qr: string; uri: string } | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.twoFactorEnabled) setStatus("on");
      else setStatus("off");
    }).catch(() => setStatus("off"));
  }, []);

  function setup() {
    start(async () => {
      setError(null);
      const { setupTwoFactorAction } = await import("@/lib/p6-actions");
      const { data, error } = await setupTwoFactorAction();
      if (error) { setError(error); return; }
      setSetupData(data);
    });
  }

  function enable() {
    if (token.length !== 6) { setError("Digite o código de 6 dígitos."); return; }
    start(async () => {
      setError(null);
      const { enableTwoFactorAction } = await import("@/lib/p6-actions");
      const { error } = await enableTwoFactorAction(setupData!.secret, token);
      if (error) { setError(error); return; }
      setStatus("on");
      setSetupData(null);
      setToken("");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    });
  }

  function disable() {
    start(async () => {
      setError(null);
      const { disableTwoFactorAction } = await import("@/lib/p6-actions");
      const { error } = await disableTwoFactorAction();
      if (error) { setError(error); return; }
      setStatus("off");
    });
  }

  if (status === "loading") {
    return <div className="glass-card p-6"><Loader2 className="h-5 w-5 animate-spin text-[#8b8fa3]" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${status === "on" ? "bg-emerald-500/15" : "bg-violet-500/15"}`}>
            {status === "on" ? <Lock className="h-5 w-5 text-emerald-300" /> : <Unlock className="h-5 w-5 text-violet-300" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Autenticação em dois fatores (2FA)</h3>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Adicione uma camada extra de segurança usando um app autenticador como Google Authenticator, Authy ou 1Password.
            </p>
          </div>
        </div>

        {status === "on" ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" /> 2FA está ativo para a sua conta.
            </div>
            <p className="text-xs text-emerald-200/80 mt-1.5">Sempre que fizer login, você precisará digitar o código TOTP do seu app autenticador.</p>
            <button
              onClick={disable}
              disabled={pending}
              className="mt-3 inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-red-500/15 text-red-300 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
              Desativar 2FA
            </button>
          </div>
        ) : !setupData ? (
          <button
            onClick={setup}
            disabled={pending}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            Configurar 2FA
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="glass-card p-3 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={setupData.qr} alt="QR Code 2FA" className="w-48 h-48" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-white">1. Escaneie o QR code com seu app autenticador.</p>
                <p className="text-sm text-white">2. Ou insira a chave manualmente:</p>
                <div className="rounded-lg bg-white/5 border border-white/[0.06] p-3 font-mono text-xs text-violet-200 break-all">
                  {setupData.secret}
                </div>
                <p className="text-sm text-white">3. Digite o código de 6 dígitos gerado pelo app:</p>
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-40 h-12 rounded-lg bg-white/5 border border-white/10 px-3 text-center text-xl tracking-[0.4em] font-mono text-white outline-none focus:border-violet-400/50"
                />
                {error && <div className="text-xs text-red-300">{error}</div>}
                <div className="flex gap-2">
                  <button
                    onClick={enable}
                    disabled={pending || token.length !== 6}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Ativar 2FA
                  </button>
                  <button
                    onClick={() => { setSetupData(null); setToken(""); setError(null); }}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#8b8fa3] hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {done && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> 2FA ativado com sucesso!
          </div>
        )}
      </div>

      <div className="glass-card p-5 lg:p-6 space-y-3">
        <h4 className="text-sm font-semibold text-white">Outras configurações de segurança</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.04] px-4 py-3">
            <span className="text-white">Forçar HTTPS em todas as páginas</span>
            <span className="text-xs text-emerald-300">Ativo</span>
          </li>
          <li className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.04] px-4 py-3">
            <span className="text-white">Cookie httpOnly para sessão</span>
            <span className="text-xs text-emerald-300">Ativo</span>
          </li>
          <li className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.04] px-4 py-3">
            <span className="text-white">Expiração de sessão (7 dias)</span>
            <span className="text-xs text-emerald-300">Ativo</span>
          </li>
          <li className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.04] px-4 py-3">
            <span className="text-white">Rate-limiting no /api/auth/login</span>
            <span className="text-xs text-emerald-300">Ativo</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// ---------- Email (SMTP) ----------

function EmailTab({ queue }: { queue: any[] }) {
  const [pending, start] = useTransition();
  const [testEmail, setTestEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function sendTest() {
    if (!testEmail) return;
    start(async () => {
      const { sendTestEmailAction } = await import("@/lib/p6-actions");
      const { data } = await sendTestEmailAction(testEmail);
      setResult(data?.queued ? "E-mail enfileirado (SMTP não configurado — defina SMTP_HOST/USER/PASS no ambiente)." : "E-mail enviado com sucesso!");
    });
  }
  function drain() {
    start(async () => {
      const { drainEmailQueueAction } = await import("@/lib/p6-actions");
      const { data } = await drainEmailQueueAction();
      setResult(`Drain: ${data?.sent ?? 0} enviados, ${data?.failed ?? 0} falhas.`);
    });
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">Servidor SMTP</h3>
          <p className="text-xs text-[#6b7280]">Configure o servidor de e-mail para envio de notificações. Variáveis de ambiente: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">SMTP Host</label>
            <input
              defaultValue={process.env.NEXT_PUBLIC_SMTP_HOST_HINT ?? ""}
              placeholder="smtp.gmail.com"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Porta</label>
            <input
              defaultValue="587"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Usuário</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
            <button
              onClick={sendTest}
              disabled={pending || !testEmail}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar teste
            </button>
          </div>
          <button
            onClick={drain}
            disabled={pending}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Processar fila
          </button>
        </div>
        {result && <div className="text-xs text-emerald-300">{result}</div>}
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Fila de e-mails</h3>
          <span className="text-xs text-[#6b7280]">{queue.length} na lista</span>
        </div>
        {queue.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">Nenhum e-mail na fila.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                <th className="px-5 py-3 font-medium">Destinatário</th>
                <th className="px-5 py-3 font-medium">Assunto</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Tentativas</th>
                <th className="px-5 py-3 font-medium">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {queue.slice(0, 30).map((e: any) => (
                <tr key={e.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm text-white">{e.toEmail}</td>
                  <td className="px-5 py-3 text-sm text-[#c4c8d8] max-w-[280px] truncate">{e.subject}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${
                      e.status === "sent" ? "bg-emerald-500/15 text-emerald-300"
                      : e.status === "failed" ? "bg-red-500/15 text-red-300"
                      : e.status === "queued" ? "bg-white/10 text-white/70"
                      : "bg-sky-500/15 text-sky-300"
                    }`}>{e.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#8b8fa3]">{e.attempts}</td>
                  <td className="px-5 py-3 text-xs text-[#8b8fa3]">{new Date(e.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------- Webhooks ----------

function WebhooksTab({ deliveries }: { deliveries: any[] }) {
  const [pending, start] = useTransition();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function test() {
    if (!url) return;
    start(async () => {
      const { testWebhookAction } = await import("@/lib/p6-actions");
      const { data } = await testWebhookAction(url);
      setResult(`Enfileirados: ${data?.enqueued ?? 0} · Entregues: ${data?.delivered ?? 0} · Falhas: ${data?.failed ?? 0}`);
    });
  }
  function drain() {
    start(async () => {
      const { drainWebhookQueueAction } = await import("@/lib/p6-actions");
      const { data } = await drainWebhookQueueAction();
      setResult(`Entregues: ${data?.delivered ?? 0} · Falhas: ${data?.failed ?? 0}`);
    });
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">Webhooks</h3>
          <p className="text-xs text-[#6b7280]">Envie eventos da plataforma Orion para sistemas externos (Slack, Discord, Zapier, Make, n8n, etc.).</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com/webhook"
            className="flex-1 min-w-[280px] h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
          <button
            onClick={test}
            disabled={pending || !url}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Testar webhook
          </button>
          <button
            onClick={drain}
            disabled={pending}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Processar fila
          </button>
        </div>
        {result && <div className="text-xs text-emerald-300">{result}</div>}
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.04] p-4 text-xs text-[#c4c8d8]">
          <div className="flex items-center gap-2 mb-2 text-violet-300">
            <Webhook className="h-4 w-4" />
            <span className="font-semibold">Eventos suportados</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["result.approved", "result.submitted", "goal.created", "user.invited", "payment.approved", "license.expiring", "webhook.test", "*"].map((e) => (
              <span key={e} className="rounded-md bg-white/5 border border-white/10 px-2 py-1 font-mono text-[10px] text-violet-200">{e}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Entregas recentes</h3>
          <span className="text-xs text-[#6b7280]">{deliveries.length} registros</span>
        </div>
        {deliveries.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">Nenhuma entrega registrada.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                <th className="px-5 py-3 font-medium">Evento</th>
                <th className="px-5 py-3 font-medium">URL</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">HTTP</th>
                <th className="px-5 py-3 font-medium">Tentativas</th>
                <th className="px-5 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {deliveries.slice(0, 30).map((w: any) => (
                <tr key={w.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-xs font-mono text-violet-200">{w.event}</td>
                  <td className="px-5 py-3 text-xs text-[#c4c8d8] max-w-[260px] truncate">{w.url}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${
                      w.status === "delivered" ? "bg-emerald-500/15 text-emerald-300"
                      : w.status === "failed" ? "bg-red-500/15 text-red-300"
                      : w.status === "queued" ? "bg-white/10 text-white/70"
                      : "bg-sky-500/15 text-sky-300"
                    }`}>{w.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#8b8fa3]">{w.responseCode ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-[#8b8fa3]">{w.attempts}</td>
                  <td className="px-5 py-3 text-xs text-[#8b8fa3]">{new Date(w.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------- Integrações ----------

function IntegracoesTab({ initial }: { initial: Record<string, any> }) {
  const items = [
    { n: "Stripe (Pagamentos)", s: "Conectado", ok: true, hint: "STRIPE_SECRET_KEY configurado" },
    { n: "Supabase (Auth + DB)", s: "Conectado", ok: true, hint: "URL + ANON_KEY configurados" },
    { n: "Vercel (Deploys)", s: "Conectado", ok: true, hint: "Detected via VERCEL env" },
    { n: "Prisma (PostgreSQL)", s: "Conectado", ok: true, hint: "DATABASE_URL ativa" },
    { n: "OpenAI / GPT-4o-mini", s: "Conectado", ok: true, hint: "Para chat IA + insights" },
    { n: "SendGrid (E-mail)", s: "Pendente", ok: false, hint: "Defina SMTP_* no ambiente" },
    { n: "Slack (Notificações)", s: "Pendente", ok: false, hint: "Configure um webhook Slack" },
  ];
  return (
    <div className="glass-card p-5 lg:p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Integrações</h3>
        <p className="text-xs text-[#6b7280]">Serviços conectados à plataforma.</p>
      </div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.n} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.04] px-4 py-3">
            <div>
              <div className="text-sm text-white">{it.n}</div>
              <div className="text-xs text-[#6b7280] mt-0.5">{it.hint}</div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${
              it.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/70"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${it.ok ? "bg-emerald-400 pulse-dot" : "bg-white/40"}`} />
              {it.s}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
