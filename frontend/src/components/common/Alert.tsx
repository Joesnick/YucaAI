import { AlertTriangle, CircleCheck, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'info' | 'warning' | 'error' | 'success';
const STYLES: Record<Variant, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100',
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-400/30 dark:bg-green-500/10 dark:text-green-100',
};
const ICONS = { info: Info, warning: AlertTriangle, error: XCircle, success: CircleCheck };
const PREFIX: Record<Variant, string> = { info: 'Información', warning: 'Advertencia', error: 'Error', success: 'Correcto' };

export function Alert({ variant = 'info', title, children, className = '' }: { variant?: Variant; title?: string; children?: ReactNode; className?: string }) {
  const Icon = ICONS[variant];
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-3 text-sm ${STYLES[variant]} ${className}`}>
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">
          <span className="sr-only">{PREFIX[variant]}: </span>
          {title ?? PREFIX[variant]}
        </p>
        {children && <div className="break-words leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
