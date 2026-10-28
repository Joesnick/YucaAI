# YucaAI · Frontend

Aplicación responsive de una sola pantalla para analizar hojas de yuca. React 18, Vite 5, TypeScript y Tailwind CSS envían la fotografía original al backend; el navegador no ejecuta modelos ni genera predicciones.

## Instalación y ejecución

```bash
npm install
cp .env.example .env
npm run dev
npm run build
```

Configura `VITE_API_BASE_URL` para habilitar el análisis real. Si está vacía, el botón explica por qué permanece deshabilitado.

## Variables de entorno

| Variable | Por defecto | Uso |
|---|---|---|
| `VITE_API_BASE_URL` | vacío | URL base del backend; `http://localhost:8000/api` es solo un ejemplo. |
| `VITE_API_HEALTH_PATH` | `/health` | Endpoint opcional de salud. |
| `VITE_API_PREDICT_PATH` | `/predict` | Clasificación. |
| `VITE_API_IMAGE_FIELD` | `file` | Campo multipart de la imagen original. |
| `VITE_API_TIMEOUT_MS` | `30000` | Tiempo máximo por solicitud. |
| `VITE_MODEL_NAME` | `Modelo del servidor` | Nombre visual del modelo desplegado. |
| `VITE_API_MODEL_ID` | vacío | Opcional: se manda solo si el backend lo exige. |
| `VITE_API_MODEL_FIELD` | vacío | Nombre del campo opcional `model_id`. |
| `VITE_IMAGE_PLANT` / `VITE_IMAGE_LEAF` | `images/yuca.webp` / `images/yuca_hoja.webp` | Imágenes de marca e ilustración. |

## Estructura

`src/` contiene configuración, servicios HTTP y normalización, hooks de backend/imagen/análisis, contexto temporal, componentes de layout/carga/resultado y utilidades. La aplicación no usa React Router: `App.tsx` renderiza directamente `Layout`, encabezado, carga, análisis y resultado.

## Decisiones

- Un único modelo ya desplegado en el backend; no hay selector ni importación.
- Inferencia exclusivamente en servidor y sin predicciones simuladas.
- Sin persistencia: no se usa localStorage, sessionStorage, IndexedDB, cookies, Cache Storage, service workers ni descargas.
- Sin historial ni exportaciones JSON/CSV.
- El tema empieza con `prefers-color-scheme` y vive solo en memoria.
- JPEG, PNG y WebP de cualquier tamaño/resolución se aceptan tras comprobar la decodificación. HEIC/HEIF, GIF y PDF se rechazan. El archivo original no se redimensiona ni recomprime.

## Pendientes del backend

1. Implementar `POST /predict` con `file` y respuesta de clasificación; `model_id` solo si resulta obligatorio.
2. Configurar CORS para el origen del frontend sin desactivar la seguridad del navegador.
3. Recomendado: `GET /health`; un `404` se considera backend en línea sin endpoint de salud.
4. Confirmar etiquetas, preprocesamiento y forma definitiva de la respuesta.
