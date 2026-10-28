import { API_CONFIG } from '../config/api';
import type { ApiHealthResponse } from '../types/api';
import { ApiError } from '../utils/errors';
import { request } from './httpClient';
import { normalizePrediction, type NormalizedPrediction } from './adapters/normalizePrediction';

export async function getHealth(signal?: AbortSignal): Promise<ApiHealthResponse> {
  return request<ApiHealthResponse>(API_CONFIG.paths.health, { signal, timeoutMs: 8000 });
}

export interface PredictResult extends NormalizedPrediction { latencyMs: number; }

/** Envía el archivo original; la inferencia se ejecuta exclusivamente en el backend. */
export async function predict(file: File, signal?: AbortSignal): Promise<PredictResult> {
  const form = new FormData();
  form.append(API_CONFIG.fields.image, file, file.name);
  if (API_CONFIG.modelId) form.append(API_CONFIG.fields.model, API_CONFIG.modelId);
  const started = performance.now();
  const raw = await request<unknown>(API_CONFIG.paths.predict, { method: 'POST', body: form, signal });
  const latencyMs = Math.round(performance.now() - started);
  try { return { ...normalizePrediction(raw), latencyMs }; }
  catch (err) { throw new ApiError('invalid-response', `Respuesta de predicción no válida: ${(err as Error).message}`, { details: raw }); }
}
