import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface ThemeColors {
  primary: string;      // accent color (buttons, highlights)
  background: string;   // main background
  surface: string;      // cards, panels
  surfaceDeep: string;  // deeper panels (roll builder)
  text: string;         // primary text
  textMuted: string;    // secondary text
  border: string;       // borders
  diceColor: string;    // 3D dice body color
}

export interface ThemePreset {
  name: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Imperial Navy',
    colors: {
      primary: '#e94560',
      background: '#1a1a2e',
      surface: '#16213e',
      surfaceDeep: '#0d1b36',
      text: '#e0e0e0',
      textMuted: '#888888',
      border: '#0f3460',
      diceColor: '#1a1a4e',
    },
  },
  {
    name: 'Rebel Alliance',
    colors: {
      primary: '#ff6b35',
      background: '#1a1208',
      surface: '#2a1f0e',
      surfaceDeep: '#1f1608',
      text: '#f0e6d0',
      textMuted: '#9a8a6a',
      border: '#3a2f1e',
      diceColor: '#4a2800',
    },
  },
  {
    name: 'Jedi Temple',
    colors: {
      primary: '#4fc3f7',
      background: '#0a1628',
      surface: '#0f2038',
      surfaceDeep: '#081420',
      text: '#d0e8f8',
      textMuted: '#6a8aaa',
      border: '#1a3050',
      diceColor: '#0a2a50',
    },
  },
  {
    name: 'Sith Order',
    colors: {
      primary: '#ff1744',
      background: '#0d0000',
      surface: '#1a0808',
      surfaceDeep: '#120404',
      text: '#f0c0c0',
      textMuted: '#884444',
      border: '#3a1010',
      diceColor: '#2a0000',
    },
  },
  {
    name: 'Mandalorian',
    colors: {
      primary: '#26c6da',
      background: '#10181c',
      surface: '#1a2a30',
      surfaceDeep: '#0e1e24',
      text: '#d0e8e8',
      textMuted: '#6a9898',
      border: '#1a3838',
      diceColor: '#0a3030',
    },
  },
  {
    name: 'Outer Rim',
    colors: {
      primary: '#ab47bc',
      background: '#120a1e',
      surface: '#1e1230',
      surfaceDeep: '#140c22',
      text: '#e0d0f0',
      textMuted: '#8a6aaa',
      border: '#2a1a40',
      diceColor: '#1e0a30',
    },
  },
];

interface ThemeContextValue {
  theme: ThemeColors;
  presetName: string;
  setPreset: (name: string) => void;
  setCustomTheme: (colors: Partial<ThemeColors>) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'jj-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [presetName, setPresetName] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.presetName || 'Imperial Navy';
      }
    } catch {}
    return 'Imperial Navy';
  });

  const [customOverrides, setCustomOverrides] = useState<Partial<ThemeColors>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.custom || {};
      }
    } catch {}
    return {};
  });

  const preset = THEME_PRESETS.find((p) => p.name === presetName) || THEME_PRESETS[0];
  const theme: ThemeColors = { ...preset.colors, ...customOverrides };

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ion-background-color', theme.background);
    root.style.setProperty('--ion-text-color', theme.text);
    root.style.setProperty('--ion-card-background', theme.surface);
    root.style.setProperty('--ion-item-background', theme.surface);
    root.style.setProperty('--ion-toolbar-background', theme.background);
    root.style.setProperty('--ion-color-primary', theme.primary);
  }, [theme]);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ presetName, custom: customOverrides }));
  }, [presetName, customOverrides]);

  const setPreset = useCallback((name: string) => {
    setPresetName(name);
    setCustomOverrides({});
  }, []);

  const setCustomTheme = useCallback((colors: Partial<ThemeColors>) => {
    setCustomOverrides((prev) => ({ ...prev, ...colors }));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, presetName, setPreset, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
