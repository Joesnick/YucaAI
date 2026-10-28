/**
 * Formas de respuesta que el adaptador ACEPTA. No son el contrato definitivo:
 * el adaptador valida y normaliza cualquier variante y reporta advertencias.
 * El contrato propuesto está documentado en docs/API_CONTRACT.md.
 */

export interface ApiHealthResponse {
  status?: string;
  version?: string;
  [k: string]: unknown;
}

/** Variantes de respuesta de predicción aceptadas. */
export interface ApiPredictResponse {
  predicted_class?: string;
  prediction?: string;
  prediccion?: string;
  valid?: boolean;
  confiable?: boolean;
  confianza?: number;
  nombre_clase?: string;
  recomendacion?: string;
  advertencias?: string[];
  label?: string;
  class?: string;
  scores?: Record<string, number> | number[] | Array<{ label?: string; class?: string; name?: string; score?: number; probability?: number; confidence?: number }>;
  probabilities?: Record<string, number> | number[];
  class_names?: string[];
  labels?: string[];
  model?: string;
  model_id?: string;
  model_version?: string;
  inference_ms?: number;
  inference_time_ms?: number;
  [k: string]: unknown;
}
