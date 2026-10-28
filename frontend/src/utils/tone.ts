import { AlertTriangle, CircleCheck, OctagonAlert, type LucideIcon } from 'lucide-react';
import { CLASS_CATALOG } from '../config/classes';
import type { ClassKey, Tone } from '../types/domain';

export const TONE_STYLES: Record<Tone, { bar: string; chip: string; text: string; icon: LucideIcon; ring: string }> = {
  healthy: {
    bar: 'bg-healthy',
    chip: 'bg-healthy-soft text-green-800 dark:bg-green-500/15 dark:text-green-200',
    text: 'text-green-800 dark:text-green-300',
    icon: CircleCheck,
    ring: 'border-green-200 dark:border-green-500/30',
  },
  warn: {
    bar: 'bg-warn',
    chip: 'bg-warn-soft text-amber-900 dark:bg-amber-500/15 dark:text-amber-200',
    text: 'text-amber-800 dark:text-amber-300',
    icon: AlertTriangle,
    ring: 'border-amber-200 dark:border-amber-500/30',
  },
  danger: {
    bar: 'bg-danger',
    chip: 'bg-danger-soft text-red-800 dark:bg-red-500/15 dark:text-red-200',
    text: 'text-red-800 dark:text-red-300',
    icon: OctagonAlert,
    ring: 'border-red-200 dark:border-red-500/30',
  },
};

export function classInfo(key: ClassKey) {
  const def = CLASS_CATALOG.find((c) => c.key === key)!;
  return { ...def, style: TONE_STYLES[def.tone] };
}
