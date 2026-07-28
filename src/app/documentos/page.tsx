import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { FolderOpen, FileText, Upload, Trash2, Download } from "lucide-react";
import { listDocumentsAction } from "@/lib/training-actions";
import { UploadDocForm, DeleteDocButton } from "./DocumentosClient";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { contract: "Contrato", id_document: "Documento", certificate: "Certificado", resume: "Currículo", policy: "Política", manual: "Manual", other: "Outro" };

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); }

export default async function DocumentosPage() {
  const { data: docs, error } = await listDocumentsAction();
  const list = docs ?? [];
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader title="Central de Documentos" description="Documentos por colaborador — contratos, certificados, políticas e mais." icon={FolderOpen} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Total</div><div className="text-2xl font-bold text-white mt-1">{list.length}</div></div>
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Contratos</div><div className="text-2xl font-bold text-violet-300 mt-1">{list.filter((d:any)=>d.type==="contract").length}</div></div>
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Certificados</div><div className="text-2xl font-bold text-emerald-300 mt-1">{list.filter((d:any)=>d.type==="certificate").length}</div></div>
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Políticas</div><div className="text-2xl font-bold text-amber-300 mt-1">{list.filter((d:any)=>d.type==="policy").length}</div></div>
        </div>
        <UploadDocForm />
        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2"><FileText className="h-4 w-4 text-violet-300" /><h3 className="text-sm font-semibold text-white">Documentos</h3><span className="text-xs text-[#6b7280] ml-auto">{list.length} arquivo(s)</span></div>
          {list.length === 0 ? <div className="px-5 py-12 text-center text-sm text-[#8b8fa3]">Nenhum documento. Use o formulário acima para enviar.</div> : (
            <table className="w-full">
              <thead><tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]"><th className="px-5 py-3 font-medium">Documento</th><th className="px-5 py-3 font-medium">Tipo</th><th className="px-5 py-3 font-medium">Data</th><th className="px-5 py-3 font-medium text-right">Ações</th></tr></thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((d: any) => (
                  <tr key={d.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3"><div className="text-sm font-medium text-white">{d.title}</div>{d.fileName && <div className="text-[10px] text-[#6b7280]">{d.fileName}</div>}</td>
                    <td className="px-5 py-3"><Badge tone="info">{TYPE_LABEL[d.type] ?? d.type}</Badge></td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{formatDate(d.createdAt)}</td>
                    <td className="px-5 py-3 text-right"><div className="inline-flex items-center gap-1"><a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-violet-300 hover:bg-violet-500/10"><Download className="h-3.5 w-3.5" /></a><DeleteDocButton id={d.id} title={d.title} /></div></td>
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
