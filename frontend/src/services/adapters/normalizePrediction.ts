import { CLASS_CATALOG, UNLABELED_SCORE_ORDER } from '../../config/classes';
import type { ApiPredictResponse } from '../../types/api';
import type { ClassKey, ClassScore } from '../../types/domain';

export interface NormalizedPrediction {
  predictedKey: ClassKey;
  predictedLabel: string;
  predictedDerived: boolean;
  scores: ClassScore[];
  scoreScale: 'probability' | 'percent';
  scoreSum: number;
  warnings: string[];
  modelReported?: string;
  backendInferenceMs?: number;
  reliable?: boolean;
  recommendation?: string;
}

export class PredictionFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PredictionFormatError';
  }
}

const norm = (s: unknown) => String(s ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

export function resolveClassKey(label: unknown): ClassKey | undefined {
  const n = norm(label);
  if (!n) return undefined;
  return CLASS_CATALOG.find((c) => c.key === label || c.aliases.some((a) => norm(a) === n))?.key;
}

const labelOf = (key: ClassKey) => CLASS_CATALOG.find((c) => c.key === key)!.label;

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Extrae pares (etiqueta, valor) de cualquiera de las variantes aceptadas. */
function extractPairs(r: ApiPredictResponse, warnings: string[]): Array<{ rawLabel: string; value: number }> {
  const source = r.scores ?? r.probabilities ?? r.probabilidades;
  const names = r.class_names ?? r.labels;
  if (source === undefined || source === null) {
    throw new PredictionFormatError('La respuesta del servidor no incluye puntuaciones (campo "scores" o "probabilities").');
  }
  if (Array.isArray(source)) {
    if (source.length === 0) throw new PredictionFormatError('La respuesta incluye una lista de puntuaciones vacía.');
    if (source.every(isNum)) {
      const order = Array.isArray(names) && names.length === source.length ? names : null;
      if (!order) {
        warnings.push(
          'El servidor devolvió puntuaciones sin etiquetas; se asignaron con el orden configurado en src/config/classes.ts (UNLABELED_SCORE_ORDER).',
        );
      }
      return (source as number[]).map((value, i) => ({ rawLabel: String(order ? order[i] : UNLABELED_SCORE_ORDER[i] ?? `clase_${i}`), value }));
    }
    return source.map((item, i) => {
      if (!item || typeof item !== 'object') throw new PredictionFormatError(`La puntuación en la posición ${i} no es válida.`);
      const o = item as Record<string, unknown>;
      const value = [o.score, o.probability, o.confidence].find(isNum);
      const rawLabel = String(o.label ?? o.class ?? o.name ?? '');
      if (value === undefined) throw new PredictionFormatError(`La puntuación de "${rawLabel || i}" no es numérica.`);
      return { rawLabel, value };
    });
  }
  if (typeof source === 'object') {
    return Object.entries(source as Record<string, unknown>).map(([rawLabel, value]) => {
      if (!isNum(value)) throw new PredictionFormatError(`La puntuación de "${rawLabel}" no es numérica.`);
      return { rawLabel, value };
    });
  }
  throw new PredictionFormatError('El formato de las puntuaciones no es reconocible.');
}

/**
 * Valida y normaliza la respuesta de predicción del backend.
 * No inventa valores: si falta información imprescindible, lanza PredictionFormatError;
 * si algo es inusual, lo informa en warnings.
 */
export function normalizePrediction(payload: unknown): NormalizedPrediction {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new PredictionFormatError('La respuesta del servidor no es un objeto JSON.');
  }
  const r = payload as ApiPredictResponse;
  const warnings: string[] = [];
  const pairs = extractPairs(r, warnings);

  if (pairs.some((p) => p.value < 0)) throw new PredictionFormatError('El servidor devolvió puntuaciones negativas.');
  const max = Math.max(...pairs.map((p) => p.value));
  const scale: 'probability' | 'percent' = max > 1.0001 ? 'percent' : 'probability';
  if (scale === 'percent' && max > 100.0001) throw new PredictionFormatError('Hay puntuaciones superiores a 100.');
  const divisor = scale === 'percent' ? 100 : 1;

  const byKey = new Map<ClassKey, ClassScore>();
  const unknownLabels: string[] = [];
  for (const p of pairs) {
    const key = resolveClassKey(p.rawLabel);
    if (!key) {
      unknownLabels.push(p.rawLabel);
      continue;
    }
    if (byKey.has(key)) warnings.push(`La clase "${labelOf(key)}" aparece repetida; se conservó el primer valor.`);
    else byKey.set(key, { key, label: labelOf(key), score: p.value / divisor, rawValue: p.value, rawLabel: p.rawLabel });
  }
  if (unknownLabels.length) {
    warnings.push(`Etiquetas no reconocidas en la respuesta: ${unknownLabels.join(', ')}. Revisa los alias en src/config/classes.ts.`);
  }
  if (byKey.size === 0) throw new PredictionFormatError('Ninguna etiqueta de la respuesta coincide con las clases configuradas.');

  const missing = CLASS_CATALOG.filter((c) => !byKey.has(c.key));
  if (missing.length) warnings.push(`El servidor no devolvió puntuación para: ${missing.map((c) => c.label).join(', ')}.`);

  const scores = CLASS_CATALOG.filter((c) => byKey.has(c.key)).map((c) => byKey.get(c.key)!);
  const sum = scores.reduce((a, s) => a + s.score, 0);
  if (Math.abs(sum - 1) > 0.02) {
    warnings.push(
      `Las puntuaciones suman ${(sum * 100).toFixed(1)} % y no 100 %. Se muestran tal como las devolvió el modelo; no se reescalaron.`,
    );
  }

  const top = scores.reduce((a, b) => (b.score > a.score ? b : a));
  const reportedLabel = r.predicted_class ?? r.prediction ?? r.prediccion ?? r.label ?? r.class;
  let predictedKey: ClassKey;
  let predictedDerived = false;
  if (reportedLabel !== undefined && reportedLabel !== null && String(reportedLabel) !== '') {
    const k = resolveClassKey(reportedLabel);
    if (!k) throw new PredictionFormatError(`La clase predicha "${String(reportedLabel)}" no coincide con las clases configuradas.`);
    predictedKey = k;
    if (k !== top.key) {
      warnings.push(
        `El servidor aplica umbrales por clase para priorizar la detección de enfermedades; la clase predicha puede no ser la de mayor puntuación.`,
      );
    }
  } else {
    predictedKey = top.key;
    predictedDerived = true;
    warnings.push('El servidor no indicó la clase predicha; se muestra la clase con la mayor puntuación recibida.');
  }

  if (Array.isArray(r.advertencias)) warnings.push(...r.advertencias.filter((item): item is string => typeof item === 'string'));
  const modelReported = [r.model_id, r.model, r.model_version].find((v) => typeof v === 'string' && v) as string | undefined;
  const inf = [r.inference_ms, r.inference_time_ms].find(isNum);

  return {
    predictedKey,
    predictedLabel: labelOf(predictedKey),
    predictedDerived,
    scores,
    scoreScale: scale,
    scoreSum: sum,
    warnings,
    modelReported,
    backendInferenceMs: inf,
    reliable: typeof r.confiable === 'boolean' ? r.confiable : undefined,
    recommendation: typeof r.recomendacion === 'string' ? r.recomendacion : undefined,
  };
}
