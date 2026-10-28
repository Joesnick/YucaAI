import { API_CONFIG } from '../config/api';
import type { ApiHealthResponse } from '../types/api';
import { ApiError } from '../utils/errors';
import { request } from './httpClient';
import { normalizePrediction, type NormalizedPrediction } from './adapters/normalizePrediction';

export async function getHealth(signal?: AbortSignal): Promise<ApiHealthResponse> {
  return request<ApiHealthResponse>(API_CONFIG.paths.health, { signal, timeoutMs: 8000 });
}

export interface PredictResult extends NormalizedPrediction { latencyMs: number; }
export interface RejectedPrediction {
  rejected: true;
  message: string;
  reason?: string;
  suggestions: string[];
}

/** Envía el archivo original; la inferencia se ejecuta exclusivamente en el backend. */
export async function predict(file: File, signal?: AbortSignal): Promise<PredictResult | RejectedPrediction> {
  const form = new FormData();
  form.append(API_CONFIG.fields.image, file, file.name);
  if (API_CONFIG.modelId) form.append(API_CONFIG.fields.model, API_CONFIG.modelId);
  const started = performance.now();
  const raw = await request<unknown>(API_CONFIG.paths.predict, { method: 'POST', body: form, signal });
  const latencyMs = Math.round(performance.now() - started);
  if (raw && typeof raw === 'object' && (raw as { valid?: unknown }).valid === false) {
    const rejection = raw as { message?: unknown; razon?: unknown; sugerencias?: unknown };
    return {
      rejected: true,
      message: typeof rejection.message === 'string' ? rejection.message : 'La imagen fue rechazada por el servidor.',
      reason: typeof rejection.razon === 'string' ? rejection.razon : undefined,
      suggestions: Array.isArray(rejection.sugerencias) ? rejection.sugerencias.filter((item): item is string => typeof item === 'string') : [],
    };
  }
  try { return { ...normalizePrediction(raw), latencyMs }; }
  catch (err) { throw new ApiError('invalid-response', `Respuesta de predicción no válida: ${(err as Error).message}`, { details: raw }); }
}
