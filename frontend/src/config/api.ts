import { env, envNumber, envString } from './env';

const baseUrl = (envString(env.VITE_API_BASE_URL) || 'http://localhost:8000').replace(/\/+$/, '');

export const API_CONFIG = {
  baseUrl,
  isConfigured: baseUrl.length > 0,
  timeoutMs: envNumber(env.VITE_API_TIMEOUT_MS, 90000),
  paths: { health: envString(env.VITE_API_HEALTH_PATH, '/'), predict: envString(env.VITE_API_PREDICT_PATH, '/predict') },
  fields: { image: envString(env.VITE_API_IMAGE_FIELD, 'file'), model: envString(env.VITE_API_MODEL_FIELD, 'model_id') },
  modelId: envString(env.VITE_API_MODEL_ID, ''),
  modelName: envString(env.VITE_MODEL_NAME, '') || 'Modelo del servidor',
} as const;
