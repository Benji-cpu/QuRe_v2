import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeColors, ThemeMode, ThemeService } from '../services/ThemeService';

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [theme, setTheme] = useState<ThemeColors>(ThemeService.getThemeColors('dark'));

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedMode = await ThemeService.getThemeMode();
    setMode(savedMode);
    setTheme(ThemeService.getThemeColors(savedMode));
  };

  const toggleTheme = async () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    await ThemeService.setThemeMode(newMode);
    setMode(newMode);
    setTheme(ThemeService.getThemeColors(newMode));
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 