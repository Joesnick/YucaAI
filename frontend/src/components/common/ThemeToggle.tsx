import { Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp(); const dark = theme === 'dark';
  return <button type="button" role="switch" aria-checked={dark} onClick={toggleTheme} className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-medium text-white transition hover:bg-white/10">
    <span className="flex items-center gap-2">{dark ? <Moon aria-hidden className="h-4 w-4" /> : <Sun aria-hidden className="h-4 w-4" />}Modo oscuro</span>
    <span aria-hidden className={`relative h-6 w-11 rounded-full transition ${dark ? 'bg-brand-400' : 'bg-slate-400/60'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${dark ? 'left-[22px]' : 'left-0.5'}`} /></span>
  </button>;
}
