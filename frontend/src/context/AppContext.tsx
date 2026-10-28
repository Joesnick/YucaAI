import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { API_CONFIG } from '../config/api';
import { useAnalysis } from '../hooks/useAnalysis';
import { useBackend } from '../hooks/useBackend';
import { useImageSelection } from '../hooks/useImageSelection';

type Theme = 'light' | 'dark';
function initialTheme(): Theme { return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

function useAppValue() {
  const [theme, setTheme] = useState<Theme>(initialTheme); const backend = useBackend();
  const imageApi = useImageSelection(); const analysis = useAnalysis();
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  const toggleTheme = useCallback(() => setTheme((value) => value === 'dark' ? 'light' : 'dark'), []);
  const blockers: string[] = [];
  if (!API_CONFIG.isConfigured) blockers.push('Configura la URL del backend (VITE_API_BASE_URL) para habilitar el análisis.');
  if (!imageApi.image) blockers.push('Selecciona una fotografía válida de la hoja.');
  const analyze = useCallback(() => { if (!blockers.length && imageApi.image) void analysis.run(imageApi.image); }, [analysis, blockers.length, imageApi.image]);
  const selectImage = useCallback((file: File | undefined | null) => {
    // El resultado anterior deja de mostrarse antes de que la selección pueda
    // revocar su URL de vista previa.
    analysis.resetCurrent();
    void imageApi.selectFile(file);
  }, [analysis, imageApi]);
  const newAnalysis = useCallback(() => { imageApi.clear(); analysis.resetCurrent(); }, [analysis, imageApi]);
  return { theme, toggleTheme, backend, imageApi, analysis, blockers, analyze, selectImage, newAnalysis };
}
export type AppValue = ReturnType<typeof useAppValue>;
const Ctx = createContext<AppValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) { return <Ctx.Provider value={useAppValue()}>{children}</Ctx.Provider>; }
export function useApp(): AppValue { const value = useContext(Ctx); if (!value) throw new Error('useApp debe usarse dentro de <AppProvider>.'); return value; }
