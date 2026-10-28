import { API_CONFIG } from '../../config/api';
import { APP_CONFIG } from '../../config/app';
import { BackendStatusPill } from '../common/BackendStatusPill';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandMark } from './BrandMark';

export function Sidebar() {
  return <div className="no-print hidden w-72 shrink-0 bg-brand-900 lg:block dark:bg-brand-950"><aside className="sticky top-0 flex h-screen flex-col px-4 py-6 text-white">
    <div className="px-2"><BrandMark /></div>
    <div className="mt-8 flex-1"><section aria-label="Información del modelo" className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-100/70">Modelo</p>
      <p className="mt-1 break-words font-semibold">{API_CONFIG.modelName}</p>
      <p className="mt-1 text-sm text-brand-100/80">Ejecutado en el servidor</p>
      <div className="mt-3"><BackendStatusPill /></div>
    </section></div>
    <div className="space-y-3"><ThemeToggle /><p className="px-1 text-[11px] text-brand-100/70">Modelo ejecutado desde el backend · v{APP_CONFIG.version}</p>
    </div>
  </aside></div>;
}
