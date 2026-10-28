# YucaAI API contract

The frontend sends the original image to FastAPI for inference. The default local URL is `http://localhost:8000`.

## `GET /` health check

FastAPI returns a JSON object with `status: "ok"` and service information.

## `POST /predict`

Send `multipart/form-data` with the image in the `file` field.

Successful response:

```json
{
  "valid": true,
  "confiable": true,
  "prediccion": "cmd",
  "confianza": 0.81,
  "probabilidades": { "cbsd": 0.12, "cmd": 0.81, "healthy": 0.07 },
  "recomendacion": "...",
  "advertencias": []
}
```

The frontend maps `prediccion` and `probabilidades` to its visible classes. If the backend returns `valid: false`, the frontend displays `message`, `razon`, and suggestions as an image-rejection notice, without score bars. Backend warnings are shown with the result.

## CORS

The backend allows frontend requests during development. Restrict allowed origins to the deployed domain in production.
