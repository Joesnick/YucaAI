import { API_CONFIG } from '../config/api';
import { ApiError } from '../utils/errors';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: BodyInit | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
  /** Señal externa para cancelar (por ejemplo, al desmontar o pulsar "Cancelar"). */
  signal?: AbortSignal;
}

/**
 * Cliente HTTP único de la aplicación (Fetch API). Todas las solicitudes pasan por aquí:
 * construye la URL, aplica tiempo de espera, cancela y traduce errores a ApiError.
 */
export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_CONFIG.isConfigured) {
    throw new ApiError('not-configured', 'El backend no está configurado (VITE_API_BASE_URL está vacío).');
  }
  const url = `${API_CONFIG.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? API_CONFIG.timeoutMs;
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onExternalAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onExternalAbort);

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      body: options.body ?? null,
      headers: { Accept: 'application/json', ...options.headers },
      signal: controller.signal,
    });
  } catch (err) {
    if (timedOut) {
      throw new ApiError('timeout', `El servidor no respondió en ${Math.round(timeoutMs / 1000)} s.`);
    }
    if (options.signal?.aborted) {
      throw new ApiError('aborted', 'La solicitud se canceló.');
    }
    throw new ApiError(
      'network',
      'No se pudo conectar con el servidor. Verifica la URL del backend, tu conexión y la configuración CORS del servidor.',
      { cause: err },
    );
  } finally {
    window.clearTimeout(timer);
    options.signal?.removeEventListener('abort', onExternalAbort);
  }

  const contentType = response.headers.get('content-type') ?? '';
  let payload: unknown = null;
  try {
    payload = contentType.includes('application/json') ? await response.json() : await response.text();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, payload);
  }
  if (!contentType.includes('application/json')) {
    throw new ApiError('invalid-response', 'El servidor respondió con un formato distinto de JSON.', {
      status: response.status,
      details: payload,
    });
  }
  return payload as T;
}
