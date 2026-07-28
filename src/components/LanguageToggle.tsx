"use client";
import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 p-2 rounded-lg transition-colors hover:bg-white/5 text-secondary"
        title="Language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase">{locale}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 rounded-lg border border-white/10 bg-[#1a1d27] shadow-xl py-1 min-w-[120px]">
          <button
            onClick={() => { setLocale("pt"); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 ${locale === "pt" ? "text-violet-300" : "text-[#c4c8d8]"}`}
          >
            🇧🇷 Português
          </button>
          <button
            onClick={() => { setLocale("en"); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 ${locale === "en" ? "text-violet-300" : "text-[#c4c8d8]"}`}
          >
            🇺🇸 English
          </button>
        </div>
      )}
    </div>
  );
}
