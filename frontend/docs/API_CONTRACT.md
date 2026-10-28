# Contrato de API propuesto para YucaAI

> Propuesta pendiente de confirmar con el backend real. El frontend no ejecuta modelos: manda la imagen original y normaliza varias formas de respuesta.

## `GET /health` (opcional)

Puede devolver, por ejemplo:

```json
{ "status": "ok", "version": "1.0.0" }
```

Un `404` se interpreta como «backend en línea, sin endpoint de salud». Un error de red se muestra como «Sin conexión», pero no bloquea `POST /predict`.

## `POST /predict` (obligatorio)

Petición `multipart/form-data`:

| Campo | Tipo | Uso |
|---|---|---|
| `file` | binario | Imagen JPEG, PNG o WebP; el nombre es configurable con `VITE_API_IMAGE_FIELD`. |
| `model_id` | texto opcional | Solo se adjunta si `VITE_API_MODEL_ID` tiene valor; el nombre usa `VITE_API_MODEL_FIELD`. |

Ejemplo de respuesta (ilustrativo, no es un resultado real):

```json
{ "predicted_class": "cmd", "scores": { "cbsd": 0.12, "cmd": 0.81, "healthy": 0.07 } }
```

También se aceptan las variantes documentadas por `normalizePrediction.ts`: `scores` o `probabilities`, listas etiquetadas, escala 0–100 y clases en `predicted_class`, `prediction`, `label` o `class`. Si la respuesta trae `model_id`, `model` o `model_version`, se muestra como información reportada por el servidor. Las puntuaciones no se renormalizan; valores o etiquetas inusuales generan advertencias.

Errores `4xx/5xx` con `{ "detail": "mensaje" }` o `{ "message": "mensaje" }` se muestran al usuario. Se recomienda `413` para archivos demasiado grandes, `415` para formato no soportado, `422` para imagen inválida y `503` cuando el modelo no esté disponible.

## CORS

El backend debe permitir el origen del frontend, por ejemplo `http://localhost:5173` en desarrollo. También se puede usar un proxy de Vite. No desactives la seguridad CORS del navegador.
