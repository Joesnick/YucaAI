import type { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen lg:flex">
    <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-brand-900">Saltar al contenido</a>
    <Sidebar />
    <div className="min-w-0 flex-1"><MobileNav />
      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 sm:space-y-5 sm:px-5 sm:py-6 lg:px-8">{children}</main>
    </div>
  </div>;
}
