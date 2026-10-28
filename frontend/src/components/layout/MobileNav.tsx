import { ThemeToggle } from '../common/ThemeToggle';
import { BrandMark } from './BrandMark';

/** Barra superior compacta sin navegación: la aplicación tiene una única pantalla. */
export function MobileNav() {
  return <header className="no-print sticky top-0 z-30 bg-brand-900 text-white shadow-md lg:hidden dark:bg-brand-950">
    <div className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}><BrandMark size="sm" /><div className="w-48 max-w-[55vw]"><ThemeToggle /></div></div>
  </header>;
}
