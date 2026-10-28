import type { ClassificationResult } from '../../types/domain';
import { classInfo } from '../../utils/tone';
import { formatPercent } from '../../utils/format';

export function ScoreBars({ result }: { result: ClassificationResult }) {
  return (
    <ul className="space-y-3">
      {result.scores.map((s) => {
        const info = classInfo(s.key);
        const Icon = info.style.icon;
        const isTop = s.key === result.predictedKey;
        return (
          <li key={s.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className={`flex items-center gap-1.5 ${isTop ? 'font-semibold' : ''}`}>
                <Icon aria-hidden className={`h-4 w-4 ${info.style.text}`} />
                {s.label}
              </span>
              <span className="tabular-nums font-medium">{formatPercent(s.score)}</span>
            </div>
            <div role="meter" aria-label={`Puntuación para ${s.label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(s.score * 1000) / 10}
              className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className={`h-full rounded-full ${info.style.bar}`} style={{ width: `${Math.max(0, Math.min(1, s.score)) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
