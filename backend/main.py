"""
API REST del detector de enfermedades en yuca.

Uso: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Fixes aplicados:
- Manejo de orientación EXIF (fotos de celular)
- Guardado de la imagen preprocesada para debug
- Umbrales de validador permisivos
- Campo 'confiable' para indicar predicciones de baja confianza
- Advertencias detalladas al usuario
"""
import io
import os
import numpy as np
from PIL import Image, ImageOps
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import cargar_modelos
from inference import predecir
from validator import validar_imagen

# Crear app
app = FastAPI(
    title="Detector de Enfermedades en Yuca",
    description=(
        "Sistema ensemble con 4 modelos CNN + TTA para detectar CBSD, CMD "
        "o hojas sanas. Accuracy: 96.74% en el conjunto de test."
    ),
    version="1.0.0"
)

# Permitir CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir al dominio del frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nombres amigables para mostrar al usuario
NOMBRES = {
    'cbsd': 'Estría Parda (CBSD)',
    'cmd': 'Mosaico de la Yuca (CMD)',
    'healthy': 'Hoja Sana'
}

RECOMENDACIONES = {
    'cbsd': (
        '⚠️ Enfermedad viral detectada. Aisle la planta y consulte a un '
        'ingeniero agrónomo. Evite usar estacas de esta planta para propagación.'
    ),
    'cmd': (
        '⚠️ Mosaico detectado. Retire las hojas afectadas y aplique control '
        'de mosca blanca (vector del virus). Consulte asistencia técnica.'
    ),
    'healthy': (
        '✅ La hoja parece estar sana. Continúe con las prácticas de manejo '
        'habituales y monitoree periódicamente.'
    )
}

# Umbral de confiabilidad (para el campo 'confiable' de la respuesta)
UMBRAL_CONFIABLE = 0.70

# Carpeta para guardar imágenes de debug
DEBUG_DIR = "debug_imgs"


@app.on_event("startup")
async def startup_event():
    """Carga los 4 modelos al iniciar el servidor."""
    print("🚀 Iniciando servidor...")
    cargar_modelos("models")
    os.makedirs(DEBUG_DIR, exist_ok=True)
    print("✅ Servidor listo para recibir peticiones.")


@app.get("/")
async def raiz():
    """Endpoint de salud."""
    return {
        'status': 'ok',
        'servicio': 'Detector de Yuca - Ensemble',
        'accuracy_test': '96.74%',
        'clases': list(NOMBRES.keys()),
        'endpoints': {
            'predict': 'POST /predict (multipart/form-data con campo "file")',
            'docs': 'GET /docs (Swagger UI)'
        }
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Recibe una imagen de hoja de yuca y devuelve la clasificación.

    Returns:
        dict con:
        - valid: si la imagen parece ser una hoja de planta
        - confiable: si la predicción tiene confianza suficiente (>70%)
        - prediccion: clase predicha (cbsd, cmd, healthy)
        - confianza: probabilidad de la clase predicha
        - probabilidades: las 3 probabilidades
        - recomendacion: texto de recomendación agronómica
        - advertencias: lista de advertencias (confianza baja, etc.)
    """
    # -----------------------------------------------------------------
    # 1. Validar tipo de archivo
    # -----------------------------------------------------------------
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser una imagen (JPG, PNG, etc.)"
        )

    try:
        # -------------------------------------------------------------
        # 2. Leer imagen aplicando rotación EXIF
        # -------------------------------------------------------------
        contenido = await file.read()
        img_pil = Image.open(io.BytesIO(contenido))

        # ⭐ FIX: aplicar rotación EXIF (importante para fotos de celular)
        img_pil = ImageOps.exif_transpose(img_pil)
        img_pil = img_pil.convert('RGB')
        img_rgb = np.array(img_pil)

        # -------------------------------------------------------------
        # 3. Guardar imagen de debug (útil para diagnóstico)
        # -------------------------------------------------------------
        try:
            img_pil.resize((224, 224)).save(
                os.path.join(DEBUG_DIR, 'ultima_entrada.jpg'),
                quality=90
            )
        except Exception as e:
            print(f"⚠️ No se pudo guardar imagen de debug: {e}")

        # -------------------------------------------------------------
        # 4. Predicción con ensemble + TTA + umbrales
        # -------------------------------------------------------------
        resultado = predecir(img_rgb)

        # -------------------------------------------------------------
        # 5. Validación (¿es realmente una hoja de planta?)
        # -------------------------------------------------------------
        probs_array = np.array([
            resultado['probabilidades'][c] for c in ['cbsd', 'cmd', 'healthy']
        ])
        validacion = validar_imagen(img_rgb, probs_array)

        # -------------------------------------------------------------
        # 6. Si NO es válida, rechazar con mensaje claro
        # -------------------------------------------------------------
        if not validacion['valido']:
            return JSONResponse({
                'valid': False,
                'confiable': False,
                'message': 'La imagen no parece una hoja de yuca válida.',
                'razon': validacion['razon'],
                'metricas_validacion': {
                    'confianza_modelo': round(validacion['max_confianza'], 4),
                    'entropia': round(validacion['entropia'], 4),
                    'ratio_vegetal': round(validacion['ratio_vegetal'], 4),
                },
                'sugerencias': [
                    'Toma la foto con buena iluminación natural',
                    'Enfoca solo la hoja, sin fondo',
                    'Acércate para que la hoja ocupe la mayor parte de la imagen',
                ]
            })

        # -------------------------------------------------------------
        # 7. Respuesta exitosa
        # -------------------------------------------------------------
        clase = resultado['clase']
        es_confiable = resultado['confianza'] >= UMBRAL_CONFIABLE

        return {
            'valid': True,
            'confiable': es_confiable,
            'prediccion': clase,
            'nombre_clase': NOMBRES[clase],
            'confianza': round(resultado['confianza'], 4),
            'probabilidades': {
                k: round(v, 4) for k, v in resultado['probabilidades'].items()
            },
            'recomendacion': RECOMENDACIONES[clase],
            'advertencias': validacion['advertencias'],
            'metricas_validacion': {
                'ratio_vegetal': round(validacion['ratio_vegetal'], 4),
                'entropia': round(validacion['entropia'], 4),
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando la imagen: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)