# YucaAI · Frontend

Aplicación responsive de una sola pantalla para analizar hojas de yuca. React 18, Vite 5, TypeScript y Tailwind CSS envían la fotografía original al backend; el navegador no ejecuta modelos ni genera predicciones.

## Instalación y ejecución

```bash
# Terminal 1: backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: frontend
cd frontend
npm install
npm run dev
```

El frontend usa `http://localhost:8000` por defecto. Cambia la URL con `VITE_API_BASE_URL` en `frontend/.env`.

## Variables de entorno

| Variable                               | Por defecto                                  | Uso                                                                   |
| -------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| `VITE_API_BASE_URL`                    | `http://localhost:8000`                 | Backend base URL.                                                     |
| `VITE_API_HEALTH_PATH`                 | `/`                                    | Endpoint opcional de salud.                                           |
| `VITE_API_PREDICT_PATH`                | `/predict`                                   | Clasificación.                                                        |
| `VITE_API_IMAGE_FIELD`                 | `file`                                       | Campo multipart de la imagen original.                                |
| `VITE_API_TIMEOUT_MS`                  | `90000`                                      | Tiempo máximo por solicitud.                                          |
| `VITE_MODEL_NAME`                      | `Modelo del servidor`                        | Nombre visual del modelo desplegado.                                  |
| `VITE_API_MODEL_ID`                    | vacío                                        | Opcional: se manda solo si el backend lo exige.                       |
| `VITE_API_MODEL_FIELD`                 | vacío                                        | Nombre del campo opcional `model_id`.                                 |
| `VITE_IMAGE_PLANT` / `VITE_IMAGE_LEAF` | `images/yuca.webp` / `images/yuca_hoja.webp` | Imágenes de marca e ilustración.                                      |

## Estructura

`src/` contiene configuración, servicios HTTP y normalización, hooks de backend/imagen/análisis, contexto temporal, componentes de layout/carga/resultado y utilidades. La aplicación no usa React Router: `App.tsx` renderiza directamente `Layout`, encabezado, carga, análisis y resultado.

## Integracion con el backend

El backend expone `GET /` para verificar disponibilidad y `POST /predict` con la imagen en el campo multipart `file`. El adaptador reconoce `prediccion`, `probabilidades` y `advertencias` de la respuesta FastAPI. CORS esta habilitado para desarrollo.
