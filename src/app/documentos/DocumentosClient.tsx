"use client";
import { useState, useTransition } from "react";
import { Loader2, Save, Trash2, Upload } from "lucide-react";
import { uploadDocumentAction, deleteDocumentAction } from "@/lib/training-actions";

export function UploadDocForm() {
  const [pending, start] = useTransition();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [type, setType] = useState("other");
  if (!show) return <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"><Upload className="h-4 w-4" />Enviar documento</button>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!title.trim() || !url.trim()) return; start(async () => { await uploadDocumentAction({ title, fileUrl: url, fileName: fileName || title, type }); setTitle(""); setUrl(""); setFileName(""); setShow(false); }); }} className="glass-card p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título *" required className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white"><option value="contract">Contrato</option><option value="id_document">Documento</option><option value="certificate">Certificado</option><option value="resume">Currículo</option><option value="policy">Política</option><option value="manual">Manual</option><option value="other">Outro</option></select>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL do arquivo *" required className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white" />
        <input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Nome do arquivo" className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white" />
      </div>
      <div className="flex gap-2"><button type="submit" disabled={pending || !title.trim() || !url.trim()} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white disabled:opacity-50">{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Salvar</button><button type="button" onClick={() => setShow(false)} className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-[#8b8fa3]">Cancelar</button></div>
    </form>
  );
}

export function DeleteDocButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  return <button onClick={() => { if (confirm(`Excluir "${title}"?`)) start(async () => { await deleteDocumentAction(id); }); }} disabled={pending} className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>;
}
