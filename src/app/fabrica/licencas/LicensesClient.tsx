"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Calendar } from "lucide-react";
import { revokeLicenseAction, extendLicenseAction } from "@/lib/license-actions";

export function RevokeButton({ id, clientName }: { id: string; clientName: string }) {
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  function revoke() {
    if (!reason.trim()) {
      alert("Informe o motivo da revogação");
      return;
    }
    start(async () => {
      const { error } = await revokeLicenseAction(id, reason.trim());
      if (error) {
        alert("Erro: " + error);
        return;
      }
      setShowForm(false);
      setReason("");
      router.refresh();
    });
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        title="Revogar licença"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
      <div className="glass-card p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-white">Revogar licença de {clientName}</h3>
        <p className="text-xs text-[#8b8fa3]">O software parará de funcionar na próxima validação.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Motivo da revogação..."
          className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={revoke}
            disabled={pending}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-red-500/15 text-red-300 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Confirmar revogação
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#8b8fa3] hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExtendButton({
  id,
  currentExpiresAt,
  status,
}: {
  id: string;
  currentExpiresAt: string | null;
  status: string;
}) {
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const router = useRouter();

  function extend() {
    if (!newDate) {
      alert("Selecione a nova data de expiração");
      return;
    }
    start(async () => {
      const { error } = await extendLicenseAction(id, newDate);
      if (error) {
        alert("Erro: " + error);
        return;
      }
      setShowForm(false);
      router.refresh();
    });
  }

  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const defaultDateStr = defaultDate.toISOString().slice(0, 10);

  return (
    <>
      <button
        onClick={() => { setNewDate(defaultDateStr); setShowForm(true); }}
        title="Estender licença"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
      >
        <Calendar className="h-3.5 w-3.5" />
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card p-5 w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white">Estender licença</h3>
            <p className="text-xs text-[#8b8fa3]">
              Expira atualmente em: {currentExpiresAt ? new Date(currentExpiresAt).toLocaleDateString("pt-BR") : "—"}
            </p>
            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nova data de expiração</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={extend}
                disabled={pending}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
                Estender
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#8b8fa3] hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
