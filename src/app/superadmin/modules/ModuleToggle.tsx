"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  company: { id: string; tradeName: string };
  moduleKey: string;
  moduleName: string;
  moduleDescription: string;
  moduleIcon: string;
  moduleColor: string;
  enabled: boolean;
  onToggle: (companyId: string, moduleKey: string, enabled: boolean) => Promise<{ error: string | null }>;
};

export function ModuleToggle({
  company,
  moduleKey,
  moduleName,
  moduleDescription,
  moduleIcon,
  moduleColor,
  enabled,
  onToggle,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await onToggle(company.id, moduleKey, !enabled);
    });
  };

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        enabled
          ? "bg-white/[0.04] border-white/[0.1]"
          : "bg-white/[0.01] border-white/[0.04]"
      }`}
      style={enabled ? { borderColor: `${moduleColor}55`, backgroundColor: `${moduleColor}0a` } : {}}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm"
            style={{
              backgroundColor: `${moduleColor}22`,
              color: moduleColor,
            }}
          >
            {moduleIcon.trim()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{moduleName}</div>
            <div className="text-[10px] text-[#8b8fa3] line-clamp-2 mt-0.5">
              {moduleDescription}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
        <span className="text-[10px] text-[#6b7280] uppercase tracking-wide">
          {enabled ? "Habilitado" : "Desabilitado"}
        </span>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? "bg-emerald-500" : "bg-white/10"
          }`}
          style={enabled ? { backgroundColor: moduleColor } : {}}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 text-white animate-spin absolute left-1/2 -translate-x-1/2" />
          ) : (
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-4.5" : "translate-x-1"
              }`}
              style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
