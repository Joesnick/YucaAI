import { useCallback, useEffect, useRef, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { getHealth } from '../services/yucaApi';
import type { ApiHealthResponse } from '../types/api';
import type { BackendStatus } from '../types/domain';
import { ApiError, toUserMessage } from '../utils/errors';

/** Consulta opcional de salud: su fallo no impide intentar una predicción. */
export function useBackend() {
  const [status, setStatus] = useState<BackendStatus>(API_CONFIG.isConfigured ? { state: 'checking' } : { state: 'not-configured' });
  const [health, setHealth] = useState<ApiHealthResponse | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (!API_CONFIG.isConfigured) return;
    abortRef.current?.abort(); const ctrl = new AbortController(); abortRef.current = ctrl;
    setStatus({ state: 'checking' });
    try {
      const h = await getHealth(ctrl.signal); setHealth(h);
      setStatus({ state: 'online', checkedAt: new Date().toISOString(), info: h as Record<string, unknown> });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      if (err instanceof ApiError && err.kind === 'not-found') {
        setStatus({ state: 'online', checkedAt: new Date().toISOString(), info: { note: 'Sin endpoint de salud.' } });
      } else setStatus({ state: 'offline', checkedAt: new Date().toISOString(), message: toUserMessage(err) });
    }
  }, []);
  useEffect(() => { void refresh(); return () => abortRef.current?.abort(); }, [refresh]);
  return { status, health, refresh };
}
