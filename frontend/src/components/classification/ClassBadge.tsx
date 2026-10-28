import type { ClassKey } from '../../types/domain';
import { classInfo } from '../../utils/tone';

export function ClassBadge({ classKey, label, size = 'md' }: { classKey: ClassKey; label?: string; size?: 'sm' | 'md' }) {
  const info = classInfo(classKey);
  const Icon = info.style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${info.style.chip} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <Icon aria-hidden className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {label ?? info.label}
    </span>
  );
}
