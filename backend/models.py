"""
Carga y gestión de los 4 modelos del ensemble.
"""
import os
import tensorflow as tf

# Configuración de los modelos
MODELOS_CONFIG = {
    'DenseNet121':      {'archivo': 'densenet121.keras',      'peso': 3},
    'EfficientNetV2B0': {'archivo': 'efficientnetv2b0.keras', 'peso': 2},
    'MobileNetV3Large': {'archivo': 'mobilenetv3large.keras', 'peso': 1},
    'ResNet50V2':       {'archivo': 'resnet50v2.keras',       'peso': 1},
}

CLASES = ['cbsd', 'cmd', 'healthy']
UMBRAL_CBSD = 0.20
UMBRAL_CMD  = 0.15

# Cache global de modelos (se cargan una sola vez al inicio)
_modelos_cargados = {}


def cargar_modelos(base_path: str = "models"):
    """Carga los 4 modelos en memoria. Se llama al iniciar el servidor."""
    global _modelos_cargados
    for nombre, config in MODELOS_CONFIG.items():
        ruta = os.path.join(base_path, config['archivo'])
        if not os.path.exists(ruta):
            raise FileNotFoundError(f"No se encontró el modelo: {ruta}")
        print(f"🔄 Cargando {nombre}...")
        _modelos_cargados[nombre] = {
            'modelo': tf.keras.models.load_model(ruta),
            'peso': config['peso']
        }
        print(f"   ✅ {nombre} cargado")
    print(f"✅ Total: {len(_modelos_cargados)} modelos cargados")


def obtener_modelos():
    return _modelos_cargados