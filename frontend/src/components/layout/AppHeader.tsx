import { APP_CONFIG } from '../../config/app';
import { BackendStatusPill } from '../common/BackendStatusPill';

/** Encabezado del área principal con la fotografía de la planta, nombre y descripción. */
export function AppHeader() {
  return (
    <header className="card flex flex-col gap-4 overflow-hidden p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <img
        src={APP_CONFIG.images.plant}
        alt="Raíces de yuca recién cosechadas"
        className="h-36 w-full rounded-xl object-cover sm:h-28 sm:w-44 lg:h-32 lg:w-52"
        width={1200}
        height={675}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white sm:text-3xl">{APP_CONFIG.name}</h1>
          <BackendStatusPill />
        </div>
        <p className="mt-1 font-medium text-brand-700 dark:text-brand-200">{APP_CONFIG.tagline}</p>
        <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">{APP_CONFIG.description}</p>
      </div>
    </header>
  );
}
