import { Plus, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ResultActions() {
  const { analysis, newAnalysis } = useApp(); const result = analysis.current; const busy = analysis.phase === 'uploading';
  return <div className="no-print flex flex-wrap gap-2">
    <button type="button" className="btn-outline" disabled={!result} onClick={() => window.print()}><Printer aria-hidden className="h-4 w-4" /> Imprimir</button>
    <button type="button" className="btn-primary" disabled={busy} onClick={newAnalysis}><Plus aria-hidden className="h-4 w-4" /> Nuevo análisis</button>
  </div>;
}
