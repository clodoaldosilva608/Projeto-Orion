"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, MessageSquare } from "lucide-react";
import { approveResultAction, rejectResultAction } from "@/lib/actions";

export function ApproveButton({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handle = () => {
    startTransition(async () => {
      const res = await approveResultAction(resultId);
      if (res.error) alert(res.error);
      else router.refresh();
    });
  };
  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 h-9 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      Aprovar
    </button>
  );
}

export function RejectButton({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectResultAction(resultId, reason || undefined);
      if (res.error) {
        alert(res.error);
      } else {
        setShowReason(false);
        setReason("");
        router.refresh();
      }
    });
  };

  if (showReason) {
    return (
      <div className="flex flex-col gap-2 items-end">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo (opcional)"
          className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-xs text-white outline-none focus:border-red-400/50"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowReason(false);
              setReason("");
            }}
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 h-8 text-xs font-medium text-[#8b8fa3] hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 px-3 h-8 text-xs font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Confirmar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowReason(true)}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 px-3 h-9 text-xs font-semibold hover:bg-red-500/25 transition-colors"
    >
      <XCircle className="h-3.5 w-3.5" />
      Rejeitar
    </button>
  );
}

export { MessageSquare };
