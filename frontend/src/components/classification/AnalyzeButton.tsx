import { ScanSearch, X } from 'lucide-react';
import { API_CONFIG } from '../../config/api';
import { useApp } from '../../context/AppContext';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';

export function AnalyzeButton() {
  const { blockers, analyze, analysis, backend } = useApp(); const busy = analysis.phase === 'uploading'; const disabled = busy || blockers.length > 0;
  return <div className="card card-pad no-print space-y-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div>
    <p className="font-semibold">Analizar con {API_CONFIG.modelName}</p><p className="muted text-sm">La imagen original se envía al servidor, donde se ejecuta el modelo.</p>
  </div><div className="flex gap-2"><button type="button" onClick={analyze} disabled={disabled} aria-describedby={blockers.length ? 'analyze-blockers' : undefined} className="btn-primary min-h-[52px] flex-1 px-6 text-base sm:flex-none">
    {busy ? <Spinner className="h-5 w-5" /> : <ScanSearch aria-hidden className="h-5 w-5" />}{busy ? 'Analizando…' : 'Analizar hoja'}</button>
    {busy && <button type="button" onClick={analysis.cancel} className="btn-outline min-h-[52px]" aria-label="Cancelar análisis"><X aria-hidden className="h-5 w-5" /></button>}</div></div>
    {busy && <div role="progressbar" aria-label="Enviando imagen y esperando respuesta del servidor" className="h-1.5 overflow-hidden rounded-full bg-brand-100 dark:bg-white/10"><div className="h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] rounded-full bg-brand-600" /></div>}
    {!busy && backend.status.state === 'offline' && API_CONFIG.isConfigured && <Alert variant="warning" title="Backend sin conexión">Puedes intentar analizar la imagen; si el servidor sigue sin disponible, la solicitud mostrará el error.</Alert>}
    {!busy && blockers.length > 0 && <ul id="analyze-blockers" className="muted list-disc space-y-0.5 pl-5 text-xs">{blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>}
    {analysis.phase === 'error' && analysis.error && <Alert variant="error" title="No se pudo completar el análisis">{analysis.error}</Alert>}
  </div>;
}
