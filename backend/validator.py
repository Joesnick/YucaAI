"""
Validador de imágenes v3: criterios en cascada con verde obligatorio.
Distingue hojas de yuca de otros objetos (perros, personas, carros, etc.).
"""
import numpy as np
import cv2


def analizar_verde_hoja(img_rgb: np.ndarray) -> float:
    """Verde específico de hoja (excluye césped y verde artificial)."""
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    mascara = cv2.inRange(hsv, np.array([35, 60, 50]), np.array([85, 255, 255]))
    return float(mascara.sum() / (255 * mascara.size))


def analizar_marron_hoja(img_rgb: np.ndarray) -> float:
    """
    Marrón-amarillento específico de hojas enfermas.
    Rango estricto que EXCLUYE el pelaje de animales (más naranja/brillante).
    """
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    # Hue más amarillo (20-30), saturación alta, valor bajo (más opaco)
    mascara = cv2.inRange(hsv, np.array([20, 100, 40]), np.array([32, 255, 170]))
    return float(mascara.sum() / (255 * mascara.size))


def analizar_region_central(img_rgb: np.ndarray) -> float:
    """Contenido vegetal (verde o marrón-hoja) en el 70% central."""
    h, w = img_rgb.shape[:2]
    mh, mw = int(h * 0.15), int(w * 0.15)
    centro = img_rgb[mh:h-mh, mw:w-mw]
    if centro.size == 0:
        return 0.0

    hsv = cv2.cvtColor(centro, cv2.COLOR_RGB2HSV)
    verde = cv2.inRange(hsv, np.array([35, 60, 50]), np.array([85, 255, 255]))
    marron = cv2.inRange(hsv, np.array([20, 100, 40]), np.array([32, 255, 170]))
    combinada = cv2.bitwise_or(verde, marron)
    return float(combinada.sum() / (255 * combinada.size))


def analizar_textura(img_rgb: np.ndarray) -> dict:
    """Textura compatible con hoja (nervaduras y bordes suaves)."""
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    bordes = cv2.Canny(gray, 50, 150)
    densidad = float(bordes.sum() / (255 * bordes.size))
    varianza = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    return {'densidad_bordes': densidad, 'varianza_laplaciano': varianza}


def calcular_entropia(probs: np.ndarray) -> float:
    probs = np.clip(probs, 1e-10, 1.0)
    return float(-np.sum(probs * np.log(probs)) / np.log(len(probs)))


def validar_imagen(img_rgb: np.ndarray, probs_ensemble: np.ndarray) -> dict:
    """
    Validación en cascada:

    PASO 1 (OBLIGATORIO): Verde de hoja ≥ 5% O marrón-hoja específico ≥ 25%.
                          Si no se cumple → rechazo inmediato.

    PASO 2 (OBLIGATORIO): Contenido vegetal en el centro ≥ 15%.
                          Si no se cumple → rechazo.

    PASO 3 (ADVERTENCIA): Textura fuera de rango → advertencia (no rechaza).

    PASO 4 (ADVERTENCIA): Confianza del modelo < 55% o entropía > 0.85
                          → advertencia (no rechaza).
    """
    verde = analizar_verde_hoja(img_rgb)
    marron = analizar_marron_hoja(img_rgb)
    centro = analizar_region_central(img_rgb)
    textura = analizar_textura(img_rgb)
    max_prob = float(np.max(probs_ensemble))
    entropy = calcular_entropia(probs_ensemble)

    razones_rechazo = []
    advertencias = []

    # ----- PASO 1: Evidencia vegetal (OBLIGATORIO) -----
    tiene_verde = verde >= 0.05
    tiene_marron_hoja = marron >= 0.25

    if not (tiene_verde or tiene_marron_hoja):
        razones_rechazo.append(
            f"La imagen no contiene suficiente evidencia de hoja de yuca. "
            f"Verde de hoja: {verde*100:.1f}% (mínimo 5%), "
            f"marrón de hoja enferma: {marron*100:.1f}% (mínimo 25%). "
            f"Esto sugiere que NO es una hoja de planta."
        )

    # ----- PASO 2: Contenido vegetal centrado (OBLIGATORIO) -----
    if razones_rechazo == [] and centro < 0.15:
        razones_rechazo.append(
            f"Poco contenido vegetal en el centro de la imagen "
            f"({centro*100:.1f}%). La hoja debería estar centrada."
        )

    # ----- PASO 3: Textura (solo advertencia) -----
    textura_ok = (
        0.02 <= textura['densidad_bordes'] <= 0.35 and
        100 <= textura['varianza_laplaciano'] <= 10000
    )
    if not textura_ok:
        advertencias.append(
            f"Textura inusual (bordes={textura['densidad_bordes']*100:.1f}%, "
            f"varianza={textura['varianza_laplaciano']:.0f}). "
            f"Verifica que la foto esté enfocada."
        )

    # ----- PASO 4: Confianza del modelo (solo advertencia) -----
    if max_prob < 0.55:
        advertencias.append(
            f"Confianza baja ({max_prob*100:.1f}%). El modelo no está seguro."
        )
    if entropy > 0.85:
        advertencias.append(
            f"Alta incertidumbre. Los modelos del ensemble no coinciden. "
            f"La imagen podría ser distinta a las del entrenamiento."
        )

    es_valido = len(razones_rechazo) == 0

    return {
        'valido': es_valido,
        'razon': ' '.join(razones_rechazo) if razones_rechazo else 'Imagen válida.',
        'advertencias': advertencias,
        'max_confianza': max_prob,
        'entropia': entropy,
        'ratio_verde': verde,
        'ratio_marron': marron,
        'ratio_vegetal': verde + marron,
        'ratio_vegetal_centro': centro,
        'densidad_bordes': textura['densidad_bordes'],
        'varianza_laplaciano': textura['varianza_laplaciano'],
    }