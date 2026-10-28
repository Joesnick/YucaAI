import { BarChart3, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime, formatPercent } from '../../utils/format';
import { classInfo } from '../../utils/tone';
import { Alert } from '../common/Alert';
import { Card } from '../common/Card';
import { ClassBadge } from './ClassBadge';
import { ResultActions } from './ResultActions';
import { ScoreBars } from './ScoreBars';

export function ResultPanel() {
  const { analysis } = useApp(); const result = analysis.current;
  return <Card id="resultado" title="Resultado de la clasificación" icon={BarChart3} className="print-area">
    {!result ? <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-white/15"><p className="font-medium">Aún no hay resultados</p><p className="muted mt-1 text-sm">Selecciona una imagen y pulsa «Analizar hoja». El resultado lo calcula el servidor.</p></div> :
      <div className="space-y-4" aria-live="polite"><div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <img src={result.previewUrl} alt={`Fotografía analizada: ${result.imageName}`} className="h-36 w-36 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10" />
        <div className="min-w-0 space-y-2"><p className="muted text-xs font-semibold uppercase tracking-wide">Clase con mayor puntuación</p><ClassBadge classKey={result.predictedKey} label={result.predictedLabel} /><p className="text-sm">{classInfo(result.predictedKey).description}</p>
          {(() => { const top = result.scores.find((score) => score.key === result.predictedKey); return top ? <p className="text-sm">Puntuación del modelo: <strong className={classInfo(result.predictedKey).style.text}>{formatPercent(top.score)}</strong></p> : null; })()}
          <dl className="muted grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs"><dt>Modelo:</dt><dd className="truncate">{result.modelLabel}</dd>{result.modelReported && <><dt>Reportado por el servidor:</dt><dd className="truncate">{result.modelReported}</dd></>}<dt>Fecha y hora:</dt><dd>{formatDateTime(result.createdAt)}</dd><dt>Imagen:</dt><dd className="truncate">{result.imageName}</dd><dt>Tiempo:</dt><dd>{result.latencyMs} ms{result.backendInferenceMs != null ? ` (inferencia en servidor: ${result.backendInferenceMs} ms)` : ''}</dd></dl>
        </div><div className="sm:col-span-2 lg:col-span-1"><p className="mb-2 text-sm font-semibold">Puntuaciones por clase</p><ScoreBars result={result} /></div></div>
        {result.warnings.length > 0 && <Alert variant="warning" title="Advertencias sobre la respuesta"><ul className="list-disc pl-4">{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></Alert>}
        <p className="muted flex gap-2 text-xs leading-relaxed"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Son puntuaciones de predicción del modelo, no un diagnóstico agronómico definitivo. Ante síntomas, confirma con un técnico o un laboratorio fitosanitario.</p>
        <p className="muted text-xs">No se guarda ninguna imagen ni resultado: al recargar la página se pierde el análisis.</p>
      </div>}
    <div className="mt-4"><ResultActions /></div>
  </Card>;
}
