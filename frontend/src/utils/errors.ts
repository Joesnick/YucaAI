export type ApiErrorKind =
  | 'not-configured'
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'validation'      // 400 / 415 / 422
  | 'not-found'       // 404
  | 'too-large'       // 413
  | 'server'          // 5xx
  | 'http'            // otros códigos
  | 'invalid-response';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  details?: unknown;

  constructor(kind: ApiErrorKind, message: string, extra: { status?: number; details?: unknown; cause?: unknown } = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = extra.status;
    this.details = extra.details;
    if (extra.cause) (this as { cause?: unknown }).cause = extra.cause;
  }

  static fromResponse(status: number, payload: unknown): ApiError {
    const serverMsg = extractServerMessage(payload);
    const suffix = serverMsg ? ` Detalle del servidor: ${serverMsg}` : '';
    if (status === 404) return new ApiError('not-found', `El endpoint solicitado no existe en el backend (404).${suffix}`, { status, details: payload });
    if (status === 413) return new ApiError('too-large', `El servidor rechazó el archivo por su tamaño (413).${suffix}`, { status, details: payload });
    if ([400, 415, 422].includes(status)) return new ApiError('validation', `El servidor rechazó la solicitud (${status}).${suffix}`, { status, details: payload });
    if (status >= 500) return new ApiError('server', `Error interno del servidor (${status}).${suffix}`, { status, details: payload });
    return new ApiError('http', `El servidor respondió con el código ${status}.${suffix}`, { status, details: payload });
  }
}

function extractServerMessage(payload: unknown): string | undefined {
  if (!payload) return undefined;
  if (typeof payload === 'string') return payload.slice(0, 240);
  if (typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    const candidate = p.detail ?? p.message ?? p.error;
    if (typeof candidate === 'string') return candidate.slice(0, 240);
    if (Array.isArray(candidate)) {
      // FastAPI: detail = [{ msg: '...' }]
      return candidate
        .map((d) => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : String(d)))
        .join('; ')
        .slice(0, 240);
    }
  }
  return undefined;
}

export function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Ocurrió un error inesperado.';
}
