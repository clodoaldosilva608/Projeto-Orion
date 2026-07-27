import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Key, ShieldCheck } from "lucide-react";
import { listApiKeysAction } from "@/lib/plugins-actions";
import { CreateKeyButton, RevokeKeyButton } from "./ApiKeysClient";

export const dynamic = "force-dynamic";

const SCOPE_LABEL: Record<string, string> = {
  read: "Somente leitura",
  write: "Leitura + escrita",
  admin: "Administrador",
};

const SCOPE_TONE: Record<string, "neutral" | "info" | "warning" | "danger" | "success" | "violet"> = {
  read: "info",
  write: "warning",
  admin: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function ApiKeysPage() {
  const { data: keys, error } = await listApiKeysAction();
  const list = keys ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1100px] mx-auto">
        <PageHeader
          title="API Keys"
          description="Gere chaves de API para acessar a API pública REST do Orion via plugins e integrações externas."
          icon={Key}
          action={<CreateKeyButton />}
        />

        {/* Info banner */}
        <div className="glass-card p-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">Como usar a API</h3>
            <p className="text-xs text-[#8b8fa3] mb-2">
              Envie a chave no header <code className="text-violet-200 bg-white/5 px-1 rounded">Authorization: Bearer orion_live_xxx</code> para acessar os endpoints públicos:
            </p>
            <ul className="text-xs text-[#8b8fa3] space-y-0.5 font-mono">
              <li>GET /api/v1/public/goals — listar metas</li>
              <li>GET /api/v1/public/results — listar resultados aprovados</li>
              <li>GET /api/v1/public/campaigns — listar campanhas</li>
              <li>GET /api/v1/public/users — listar usuários</li>
              <li>GET /api/v1/public/leaderboard?period=month — ranking de pontos</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-white">Chaves de API ativas</h3>
            </div>
            <span className="text-xs text-[#6b7280]">{list.length} chaves</span>
          </div>
          {list.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#8b8fa3]">
              Nenhuma chave de API ainda. Clique em "Gerar nova chave" acima.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Chave (parcial)</th>
                  <th className="px-5 py-3 font-medium">Escopo</th>
                  <th className="px-5 py-3 font-medium">Requests</th>
                  <th className="px-5 py-3 font-medium">Último uso</th>
                  <th className="px-5 py-3 font-medium">Criada em</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((k: any) => (
                  <tr key={k.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-sm font-medium text-white">{k.name}</td>
                    <td className="px-5 py-3">
                      <code className="text-xs font-mono text-violet-200 bg-white/5 px-2 py-1 rounded">
                        {k.keyPrefix}…
                      </code>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={SCOPE_TONE[k.scope] ?? "neutral"}>
                        {SCOPE_LABEL[k.scope] ?? k.scope}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#c4c8d8]">{k.requestCount.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                      {k.lastUsedAt ? formatDate(k.lastUsedAt) : "Nunca"}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{formatDate(k.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <RevokeKeyButton id={k.id} name={k.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
