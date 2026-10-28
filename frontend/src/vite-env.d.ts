/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_HEALTH_PATH?: string;
  readonly VITE_API_PREDICT_PATH?: string;
  readonly VITE_API_IMAGE_FIELD?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_MODEL_NAME?: string;
  readonly VITE_API_MODEL_ID?: string;
  readonly VITE_API_MODEL_FIELD?: string;
  readonly VITE_IMAGE_PLANT?: string;
  readonly VITE_IMAGE_LEAF?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
