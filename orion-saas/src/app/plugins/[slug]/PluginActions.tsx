"use client";

import { useState, useTransition } from "react";
import { Loader2, Download, Trash2, Save, CheckCircle2 } from "lucide-react";
import {
  installPluginAction,
  uninstallPluginAction,
  updatePluginConfigAction,
} from "@/lib/plugins-actions";

export function PluginActions({
  slug,
  displayName,
  isInstalled,
  installation,
  configSchema,
  defaultConfig,
}: {
  slug: string;
  displayName: string;
  isInstalled: boolean;
  installation: any;
  configSchema: any;
  defaultConfig: any;
}) {
  const [pending, start] = useTransition();
  const [showConfig, setShowConfig] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<Record<string, any>>(
    (installation?.config as any) ?? defaultConfig ?? {}
  );

  function install() {
    start(async () => {
      await installPluginAction(slug, config);
    });
  }
  function uninstall() {
    if (!confirm(`Desinstalar "${displayName}"?`)) return;
    start(async () => {
      await uninstallPluginAction(slug);
    });
  }
  function saveConfig() {
    start(async () => {
      await updatePluginConfigAction(slug, config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setShowConfig(false);
    });
  }

  return (
    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
      {!isInstalled ? (
        <button
          onClick={install}
          disabled={pending}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Instalar plugin
        </button>
      ) : (
        <>
          <div className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-500/15 text-emerald-300 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" /> Instalado
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
          >
            {showConfig ? "Fechar" : "Configurar"}
          </button>
          <button
            onClick={uninstall}
            disabled={pending}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Desinstalar
          </button>
        </>
      )}

      {showConfig && configSchema && Object.keys(configSchema).length > 0 && (
        <div className="mt-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] space-y-3 w-full sm:w-80">
          {Object.entries(configSchema).map(([key, schema]: [string, any]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1">
                {schema.label}
                {schema.required && <span className="text-amber-300"> *</span>}
              </label>
              {schema.type === "boolean" ? (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!config[key]}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500"
                  />
                  <span className="text-xs text-[#c4c8d8]">Ativo</span>
                </label>
              ) : schema.type === "select" ? (
                <select
                  value={config[key] ?? ""}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
                >
                  {(schema.options ?? []).map((o: string) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : schema.type === "password" ? (
                <input
                  type="password"
                  value={config[key] ?? ""}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
                />
              ) : (
                <input
                  type={schema.type === "number" ? "number" : "text"}
                  value={config[key] ?? ""}
                  onChange={(e) => setConfig({
                    ...config,
                    [key]: schema.type === "number" ? Number(e.target.value) : e.target.value,
                  })}
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
                />
              )}
            </div>
          ))}
          <button
            onClick={saveConfig}
            disabled={pending}
            className="inline-flex items-center gap-2 w-full h-9 rounded-lg brand-gradient text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 justify-center"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Salvar configuração
          </button>
          {saved && <div className="text-xs text-emerald-300 text-center">Salvo ✓</div>}
        </div>
      )}
    </div>
  );
}
