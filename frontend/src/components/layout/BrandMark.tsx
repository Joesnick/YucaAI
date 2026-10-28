import { Leaf } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

/** Fotografía original de la planta + icono complementario (no se genera un logotipo artificial). */
export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`relative ${box} shrink-0`}>
        <img src={APP_CONFIG.images.plant} alt="Fotografía de raíces de yuca, identidad visual de YucaAI" className={`${box} rounded-xl object-cover ring-1 ring-white/20`} />
        <span aria-hidden className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-400 text-brand-950 ring-2 ring-brand-900">
          <Leaf className="h-3 w-3" />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-bold leading-tight tracking-tight text-white">{APP_CONFIG.name}</span>
        <span className={`block text-xs leading-snug text-brand-100/85 ${size === 'sm' ? 'truncate' : ''}`}>{APP_CONFIG.tagline}</span>
      </span>
    </div>
  );
}
