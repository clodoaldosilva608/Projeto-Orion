"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Download, Search as SearchIcon } from "lucide-react";
import { installPluginAction } from "@/lib/plugins-actions";
import { PLUGIN_CATEGORIES } from "@/lib/plugins-helpers";

export function InstallButton({ slug, name }: { slug: string; name: string }) {
  const [pending, start] = useTransition();
  function install() {
    start(async () => {
      await installPluginAction(slug);
    });
  }
  return (
    <button
      onClick={install}
      disabled={pending}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      Instalar
    </button>
  );
}

export function PluginSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialSearch);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("search", value);
    else url.searchParams.delete("search");
    router.push(url.toString());
  }
  return (
    <form onSubmit={submit} className="flex-1 relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar plugins..."
        className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] pl-10 pr-3 text-sm text-white outline-none focus:border-violet-400/50"
      />
    </form>
  );
}

export function CategoryFilter({ current }: { current: string }) {
  const router = useRouter();
  return (
    <select
      defaultValue={current}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value === "all") url.searchParams.delete("category");
        else url.searchParams.set("category", e.target.value);
        router.push(url.toString());
      }}
      className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
    >
      <option value="all">Todas as categorias</option>
      {PLUGIN_CATEGORIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.icon} {c.label}
        </option>
      ))}
    </select>
  );
}
