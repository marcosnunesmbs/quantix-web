import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export type AccentColor =
  | 'emerald'
  | 'blue'
  | 'orange'
  | 'cyan'
  | 'red'
  | 'purple'
  | 'pink'
  | 'green';

export const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: 'emerald', label: 'Esmeralda', hex: '#10B981' },
  { id: 'blue',    label: 'Azul',      hex: '#3B82F6' },
  { id: 'orange',  label: 'Laranja',   hex: '#F97316' },
  { id: 'cyan',    label: 'Ciano',     hex: '#06B6D4' },
  { id: 'red',     label: 'Vermelho',  hex: '#EF4444' },
  { id: 'purple',  label: 'Roxo',      hex: '#A855F7' },
  { id: 'pink',    label: 'Rosa',      hex: '#EC4899' },
  { id: 'green',   label: 'Verde',     hex: '#22C55E' },
];

const VALID_ACCENTS = ACCENT_COLORS.map((c) => c.id);

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('accentColor') as AccentColor;
    return VALID_ACCENTS.includes(saved) ? saved : 'emerald';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
