"use client";
import { useState, useTransition, useEffect } from "react";
import { Loader2, Plus, RefreshCw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

type Integration = { id: string; erpType: string; name: string; status: string; lastSyncAt: string | null; syncInterval: string };

export function ErpIntegrationClient() {
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [erpType, setErpType] = useState("totvs");
  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    fetch("/api/integracoes/list").then(r => r.ok ? r.json() : null).then(d => { if (d?.data) setIntegrations(d.data); }).catch(() => {});
  }, []);

  function create() {
    if (!name.trim()) return;
    start(async () => {
      const res = await fetch("/api/integracoes/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ erpType, name, apiUrl, apiKey }) });
      if (res.ok) { setShowForm(false); setName(""); setApiUrl(""); setApiKey(""); window.location.reload(); }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Integrações ativas</h3>
        {!showForm && <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />Nova integração</button>}
      </div>
      {showForm && (
        <div className="glass-card p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={erpType} onChange={(e) => setErpType(e.target.value)} className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white"><option value="totvs">Totvs Protheus</option><option value="sap_b1">SAP Business One</option><option value="sankhya">Sankhya</option><option value="bentry">Bentry</option><option value="custom">API Customizada</option></select>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da integração *" className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white" />
            <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="API URL" className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white" />
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="API Key" className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white" />
          </div>
          <div className="flex gap-2"><button onClick={create} disabled={pending || !name.trim()} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white disabled:opacity-50">{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Criar</button><button onClick={() => setShowForm(false)} className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-[#8b8fa3]">Cancelar</button></div>
        </div>
      )}
      {integrations.length === 0 && !showForm ? (
        <div className="glass-card p-8 text-center text-sm text-[#8b8fa3]">Nenhuma integração ativa ainda.</div>
      ) : (
        <div className="space-y-2">
          {integrations.map((i) => (
            <div key={i.id} className="glass-card p-4 flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${i.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-[#6b7280]"}`}>{i.status === "active" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}</div>
              <div className="flex-1"><div className="text-sm font-medium text-white">{i.name}</div><div className="text-[10px] text-[#6b7280]">{i.erpType} · {i.syncInterval} · {i.lastSyncAt ? `Última sync: ${new Date(i.lastSyncAt).toLocaleString("pt-BR")}` : "Nunca sincronizado"}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
