import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Code2, Key, Webhook, Database, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/public/goals", desc: "Lista todas as metas da empresa", auth: "Bearer API Key" },
  { method: "GET", path: "/api/v1/public/results", desc: "Lista resultados aprovados", auth: "Bearer API Key" },
  { method: "GET", path: "/api/v1/public/campaigns", desc: "Lista campanhas ativas", auth: "Bearer API Key" },
  { method: "GET", path: "/api/v1/public/users", desc: "Lista usuários (sem PII)", auth: "Bearer API Key" },
  { method: "GET", path: "/api/v1/public/leaderboard", desc: "Ranking de pontos (month/all)", auth: "Bearer API Key" },
  { method: "POST", path: "/api/v1/public/license/validate", desc: "Valida licença de software", auth: "Body JSON" },
  { method: "GET", path: "/api/v1/public/license/validate", desc: "Valida licença via query param", auth: "?key=ORION-..." },
  { method: "POST", path: "/api/fabrica/briefing/generate-ia", desc: "Gera PRD via IA (async)", auth: "Cookie session" },
  { method: "GET", path: "/api/cron/drain", desc: "Processa filas de email + webhook", auth: "?key=CRON_SECRET" },
  { method: "POST", path: "/api/auth/login", desc: "Login com email + senha", auth: "Form POST" },
  { method: "POST", path: "/api/auth/logout", desc: "Logout (limpa cookies)", auth: "Cookie session" },
  { method: "GET", path: "/api/auth/me", desc: "Dados do usuário logado", auth: "Cookie session" },
  { method: "POST", path: "/api/auth/2fa/verify", desc: "Verifica código TOTP 2FA", auth: "Body JSON" },
];

export default function ApiDocsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1000px] mx-auto">
        <PageHeader title="API Pública v1" description="Documentação OpenAPI da plataforma Orion SaaS." icon={Code2} />
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Key className="h-4 w-4 text-violet-300" /> Autenticação</h3>
          <p className="text-xs text-[#8b8fa3] mb-2">Todas as rotas <code className="text-violet-200 bg-white/5 px-1 rounded">/api/v1/public/*</code> requerem uma API Key no header:</p>
          <pre className="text-xs font-mono text-emerald-200 bg-black/30 rounded-lg p-3 overflow-x-auto">Authorization: Bearer orion_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</pre>
          <p className="text-xs text-[#8b8fa3] mt-2">Gere sua API Key em <a href="/plugins/api-keys" className="text-violet-300 hover:text-violet-200">/plugins/api-keys</a></p>
        </div>
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2"><Code2 className="h-4 w-4 text-violet-300" /><h3 className="text-sm font-semibold text-white">Endpoints</h3></div>
          <table className="w-full">
            <thead><tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]"><th className="px-5 py-3 font-medium">Método</th><th className="px-5 py-3 font-medium">Endpoint</th><th className="px-5 py-3 font-medium">Descrição</th><th className="px-5 py-3 font-medium">Auth</th></tr></thead>
            <tbody className="divide-y divide-white/[0.04]">
              {ENDPOINTS.map((e, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3"><span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${e.method === "GET" ? "bg-sky-500/15 text-sky-300" : "bg-emerald-500/15 text-emerald-300"}`}>{e.method}</span></td>
                  <td className="px-5 py-3"><code className="text-xs font-mono text-violet-200">{e.path}</code></td>
                  <td className="px-5 py-3 text-xs text-[#c4c8d8]">{e.desc}</td>
                  <td className="px-5 py-3 text-[10px] text-[#8b8fa3]">{e.auth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Exemplo de uso</h3>
          <pre className="text-xs font-mono text-emerald-200 bg-black/30 rounded-lg p-3 overflow-x-auto">{`# Listar metas
curl -H "Authorization: Bearer orion_live_xxx" \\
  https://orion-saas-platform.vercel.app/api/v1/public/goals

# Validar licença
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"licenseKey":"ORION-XXXX-XXXX-XXXX-XXXX"}' \\
  https://orion-saas-platform.vercel.app/api/v1/public/license/validate`}</pre>
        </div>
      </div>
    </DashboardLayout>
  );
}
