/** Lectura tipada y segura de las variables de entorno de Vite. */
const env = import.meta.env;

export function envString(value: string | undefined, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function envNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export { env };
