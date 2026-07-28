"use client";
import { Moon, Sun, Bell, Search, Menu } from "lucide-react";
import { useTheme } from "@/app/theme-provider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useState } from "react";

export function Header({ userEmail, userName, onOpenMobile }: { userEmail?: string; userName?: string; onOpenMobile?: () => void }) {
  const { theme, toggle } = useTheme();
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 border-b" style={{ background: "var(--bg-sidebar)", borderBottom: "1px solid var(--border-subtle)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-lg transition-colors hover:bg-white/5 text-secondary md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative flex-1 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Buscar clientes, projetos, aplicações..." className="input-search" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-tiny font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--bg-hover)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="p-2 rounded-lg transition-colors hover:bg-white/5 text-secondary" title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <LanguageToggle />
        <button className="p-2 rounded-lg transition-colors hover:bg-white/5 text-secondary relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-tiny font-bold text-white flex items-center justify-center pulse-dot" style={{ background: "var(--danger)" }}>1</span>
        </button>
        <button className="p-2 rounded-lg transition-colors hover:bg-white/5 text-secondary hidden sm:flex items-center gap-2">
          <span className="text-sm hidden md:inline">{today}</span>
        </button>
        <div className="w-px h-6 mx-1" style={{ background: "var(--border-subtle)" }} />
        <button className="flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "2px solid rgba(255,255,255,0.1)" }}>AO</div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-primary leading-tight">{userName || "Admin Orion"}</p>
            <p className="text-tiny text-muted">Super Administrador</p>
          </div>
        </button>
      </div>
    </header>
  );
}
