"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2, Copy, Check, X } from "lucide-react";
import { createApiKeyAction, revokeApiKeyAction } from "@/lib/plugins-actions";

export function CreateKeyButton() {
  const [pending, start] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState("read");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function open() {
    setName("");
    setScope("read");
    setNewKey(null);
    setShowModal(true);
  }

  function create() {
    if (!name.trim()) return;
    start(async () => {
      const { data } = await createApiKeyAction(name.trim(), scope as any);
      if (data?.key) {
        setNewKey(data.key);
      }
    });
  }

  function copy() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function close() {
    setShowModal(false);
    setNewKey(null);
  }

  return (
    <>
      <button
        onClick={open}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95"
      >
        <Plus className="h-4 w-4" />
        Gerar nova chave
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={close}>
          <div
            className="glass-card p-6 w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-white">
                {newKey ? "Chave criada!" : "Gerar nova chave de API"}
              </h3>
              <button onClick={close} className="text-[#8b8fa3] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!newKey ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Plugin WhatsApp / Zapier / n8n"
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Escopo</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
                  >
                    <option value="read">Somente leitura (GET)</option>
                    <option value="write">Leitura + escrita (GET, POST, PUT, DELETE)</option>
                    <option value="admin">Administrador (tudo)</option>
                  </select>
                </div>
                <button
                  onClick={create}
                  disabled={pending || !name.trim()}
                  className="inline-flex items-center gap-2 w-full h-10 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 justify-center"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Gerar chave
                </button>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  ⚠️ Copie esta chave agora — ela não será exibida novamente por motivos de segurança.
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Sua chave de API</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={newKey}
                      className="flex-1 h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-xs font-mono text-emerald-200 outline-none"
                    />
                    <button
                      onClick={copy}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-violet-500/15 text-violet-300 hover:bg-violet-500/20"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="inline-flex items-center gap-2 w-full h-10 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 justify-center"
                >
                  Concluído
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function RevokeKeyButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  function revoke() {
    if (!confirm(`Revogar a chave "${name}"? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      await revokeApiKeyAction(id);
    });
  }
  return (
    <button
      onClick={revoke}
      disabled={pending}
      title="Revogar chave"
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
