"use client";

import { useState, useTransition } from "react";
import { AVAILABLE_MODULES } from "@/lib/modules-catalog";
import { toggleModuleAction } from "@/lib/modules-actions";
import { ModuleToggle } from "./ModuleToggle";

type Company = {
  id: string;
  tradeName: string;
  subdomain: string | null;
  plan: string;
  active: boolean;
  primaryColor: string;
  appName: string;
  usersCount: number;
  license: { plan: string; status: string; expirationDate: Date } | null;
  modules: Record<string, boolean>;
};

export function ModulesPanel({ companies }: { companies: Company[] }) {
  return (
    <div className="space-y-4">
      {companies.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">
          Nenhuma empresa cadastrada.
        </div>
      ) : (
        companies.map((c) => (
          <CompanyModuleCard key={c.id} company={c} />
        ))
      )}
    </div>
  );
}

function CompanyModuleCard({ company }: { company: Company }) {
  return (
    <div className="glass-card p-5">
      {/* Header da empresa */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white"
          style={{ backgroundColor: company.primaryColor }}
        >
          {company.tradeName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{company.tradeName}</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                company.active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-red-500/15 text-red-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  company.active ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              {company.active ? "Ativa" : "Suspensa"}
            </span>
          </div>
          <div className="text-[10px] text-[#8b8fa3] mt-0.5 flex items-center gap-2">
            {company.subdomain && (
              <code className="font-mono text-violet-200 bg-white/5 px-1.5 py-0.5 rounded">
                {company.subdomain}
              </code>
            )}
            <span className="capitalize">Plano: {company.plan}</span>
            <span>·</span>
            <span>{company.usersCount} usuário(s)</span>
            {company.license && (
              <>
                <span>·</span>
                <span>Licença: {company.license.status}</span>
                <span>·</span>
                <span>
                  Expira: {new Date(company.license.expirationDate).toLocaleDateString("pt-BR")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {AVAILABLE_MODULES.map((m) => (
          <ModuleToggle
            key={m.key}
            company={{
              id: company.id,
              tradeName: company.tradeName,
            }}
            moduleKey={m.key}
            moduleName={m.name}
            moduleDescription={m.description}
            moduleIcon={m.icon}
            moduleColor={m.color}
            enabled={company.modules[m.key] ?? false}
            onToggle={toggleModuleAction}
          />
        ))}
      </div>
    </div>
  );
}
