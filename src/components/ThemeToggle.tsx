"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

/**
 * ThemeToggle — small icon button that switches dark/light mode.
 * Shows a Moon icon in dark mode and a Sun icon in light mode.
 * Defaults to dark on first visit; choice is persisted by ThemeProvider.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
      title={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-fg hover:text-fg hover:bg-chip hover:bg-chip-hover transition-colors"
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
