import DashboardLayout from "../dashboard/layout";
import { ShieldAlert, Lock, FileText, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PrivacidadePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Política de Privacidade</h1>
          <p className="text-sm mt-1 text-secondary">Conformidade com a LGPD (Lei nº 13.709/2018)</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Orion Platform — LGPD</h2>
              <p className="text-xs text-muted">Última atualização: Julho 2025</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-secondary">
            <div>
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-400" /> 1. Dados Coletados</h3>
              <p>Coletamos: nome, e-mail, telefone (opcional), CNPJ (empresas), dados de acesso (IP, navegador, horário). Todos os dados são armazenados no Supabase (PostgreSQL) com criptografia em trânsito (TLS 1.3) e em repouso (AES-256).</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-400" /> 2. Finalidade do Tratamento</h3>
              <p>Os dados são utilizados exclusivamente para: autenticação, gestão de metas/indicadores, auditoria, notificações e conformidade legal. Não vendemos ou compartilhamos dados com terceiros.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-indigo-400" /> 3. Direitos do Titular (Art. 18, LGPD)</h3>
              <p>Você tem direito a: confirmar a existência de tratamento, acessar os dados, corrigir, anonimizar, portar, eliminar e revogar consentimento. Para exercer, contate: <a href="mailto:dpo@orion.com" className="text-indigo-400">dpo@orion.com</a></p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400" /> 4. Cookies</h3>
              <p>Usamos cookies essenciais (autenticação) e analíticos (anonimizados). Você pode gerenciar consentimento no banner exibido na primeira visita ou nas configurações do navegador.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-400" /> 5. Segurança</h3>
              <p>Implementamos: RBAC (Role-Based Access Control), auditoria de todas as ações, criptografia AES-256, backup automático, rate limiting, e isolamento multi-tenant via company_id + RLS.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
