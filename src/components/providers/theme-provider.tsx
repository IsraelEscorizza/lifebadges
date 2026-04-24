"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark-neon" | "light" | "midnight" | "forest" | "sunset";

export const THEMES: { id: Theme; label: string; primary: string; bg: string }[] = [
  { id: "dark-neon", label: "Dark Neon",  primary: "#00d4ff", bg: "#0e0f11" },
  { id: "light",     label: "Light",      primary: "#3b82f6", bg: "#f7f7f7" },
  { id: "midnight",  label: "Midnight",   primary: "#8b5cf6", bg: "#0f1023" },
  { id: "forest",    label: "Forest",     primary: "#22c55e", bg: "#0a100c" },
  { id: "sunset",    label: "Sunset",     primary: "#f97316", bg: "#110a04" },
];

const LS_KEY = "lb-theme";
const DEFAULT: Theme = "dark-neon";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: DEFAULT, setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT);

  // Sync from DOM on mount (anti-FOUT script may have already set it)
  useEffect(() => {
    const stored = (localStorage.getItem(LS_KEY) as Theme) ?? DEFAULT;
    setThemeState(stored);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(LS_KEY, t);
    const html = document.documentElement;
    if (t === "dark-neon") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", t);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
