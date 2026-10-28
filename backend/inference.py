"""
Pipeline de inferencia: TTA N=4 + Weighted Ensemble + Umbrales.
Réplica exacta del pipeline que dio 96.74% en el conjunto de test.
"""
import numpy as np
import tensorflow as tf
from models import obtener_modelos, CLASES, UMBRAL_CBSD, UMBRAL_CMD


def preprocesar(img_rgb: np.ndarray) -> tf.Tensor:
    """
    Redimensiona a 224x224 y convierte a tensor float32 [0, 255].
    El modelo ya incluye su capa de preprocess_input internamente.
    """
    img = tf.cast(img_rgb, tf.float32)
    img = tf.image.resize(img, [224, 224])
    img = tf.clip_by_value(img, 0.0, 255.0)
    return tf.expand_dims(img, 0)  # [1, 224, 224, 3]


def predecir_con_tta(modelo, tensor_base: tf.Tensor) -> np.ndarray:
    """
    Aplica 4 transformaciones TTA a la imagen base y promedia las 4
    predicciones resultantes.

    Args:
        modelo: modelo Keras
        tensor_base: tensor [1, 224, 224, 3]

    Returns:
        probabilidades promedio [3]
    """
    versiones = [
        tensor_base,                                # original
        tf.image.flip_left_right(tensor_base),      # flip horizontal
        tf.image.rot90(tensor_base, k=1),           # rotación 90°
        tf.image.rot90(tensor_base, k=3),           # rotación 270°
    ]

    predicciones = []
    for version in versiones:
        pred = modelo.predict(version, verbose=0)[0]
        predicciones.append(pred)

    return np.mean(predicciones, axis=0)


def aplicar_ensemble(probs_por_modelo: dict) -> np.ndarray:
    """
    Weighted ensemble con pesos 3:2:1:1.
    DenseNet121=3, EfficientNetV2B0=2, MobileNetV3=1, ResNet50V2=1.
    """
    modelos = obtener_modelos()
    probs_final = np.zeros(len(CLASES))
    peso_total = 0

    for nombre, probs in probs_por_modelo.items():
        peso = modelos[nombre]['peso']
        probs_final += probs * peso
        peso_total += peso

    return probs_final / peso_total


def aplicar_umbrales(probs: np.ndarray) -> int:
    """
    Aplica umbrales agronómicos para priorizar la detección de CBSD.
    Réplica del pipeline que dio 96.74%.
    """
    clase = int(np.argmax(probs))

    if probs[0] >= UMBRAL_CBSD:
        clase = 0  # CBSD
    elif probs[1] >= UMBRAL_CMD and clase != 0:
        clase = 1  # CMD

    return clase


def predecir(img_rgb: np.ndarray) -> dict:
    """
    Pipeline completo: TTA N=4 + Ensemble ponderado + Umbrales.

    Returns:
        dict con 'clase', 'probabilidades' y 'confianza'
    """
    tensor_base = preprocesar(img_rgb)
    modelos = obtener_modelos()

    probs_por_modelo = {}
    for nombre, data in modelos.items():
        probs_por_modelo[nombre] = predecir_con_tta(data['modelo'], tensor_base)

    probs_ensemble = aplicar_ensemble(probs_por_modelo)
    clase_idx = aplicar_umbrales(probs_ensemble)

    return {
        'clase': CLASES[clase_idx],
        'probabilidades': {
            CLASES[i]: float(probs_ensemble[i]) for i in range(len(CLASES))
        },
        'confianza': float(probs_ensemble[clase_idx])
    }