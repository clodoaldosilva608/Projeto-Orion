"use client";

import { useTransition } from "react";
import { Database, Loader2, Trash2 } from "lucide-react";
import { createBackupAction, deleteBackupAction } from "@/lib/p6-actions";

export function CreateBackupButton() {
  const [pending, start] = useTransition();
  function onClick() {
    start(async () => {
      await createBackupAction("full");
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
      {pending ? "Gerando backup..." : "Novo backup"}
    </button>
  );
}

export function DeleteBackupButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm("Tem certeza que deseja excluir este backup?")) return;
    start(async () => {
      await deleteBackupAction(id);
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      title="Excluir backup"
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
