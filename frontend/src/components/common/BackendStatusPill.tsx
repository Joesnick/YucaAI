import { CircleDashed, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Spinner } from './Spinner';

export function BackendStatusPill({ compact = false }: { compact?: boolean }) {
  const { backend } = useApp();
  const s = backend.status;
  const map = {
    'not-configured': { label: 'Backend sin configurar', cls: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200', icon: <CircleDashed aria-hidden className="h-3.5 w-3.5" /> },
    checking: { label: 'Conectando…', cls: 'bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200', icon: <Spinner className="h-3.5 w-3.5" /> },
    online: { label: 'Backend conectado', cls: 'bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-200', icon: <Wifi aria-hidden className="h-3.5 w-3.5" /> },
    offline: { label: 'Backend sin conexión', cls: 'bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200', icon: <WifiOff aria-hidden className="h-3.5 w-3.5" /> },
  }[s.state];
  return (
    <span role="status" className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${map.cls}`} title={s.state === 'offline' ? s.message : undefined}>
      {map.icon}
      <span className={compact ? 'sr-only sm:not-sr-only' : ''}>{map.label}</span>
    </span>
  );
}
