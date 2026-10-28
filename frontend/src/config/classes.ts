import type { ClassDefinition } from '../types/domain';

/**
 * Las tres categorías que distingue el modelo.
 * Los nombres visibles son configurables: sustitúyelos por los nombres comunes o científicos reales
 * (en el proyecto: estría parda de la yuca, CBSD, y mosaico de la yuca, CMD).
 *
 *  - key:     clave canónica usada por el frontend.
 *  - aliases: etiquetas que el backend podría devolver para esa clase (se comparan sin mayúsculas).
 *  - tone:    color semántico (verde = sana, naranja = enfermedad 1, rojo = enfermedad 2).
 */
export const CLASS_CATALOG: ClassDefinition[] = [
  {
    key: 'healthy',
    label: 'Hoja sana',
    description: 'El modelo no identifica signos de enfermedad en la hoja.',
    aliases: ['healthy', 'sana', 'hoja sana', 'saludable'],
    tone: 'healthy',
  },
  {
    key: 'disease1',
    label: 'Enfermedad 1',
    description: 'El modelo asocia la hoja con la primera enfermedad configurada.',
    aliases: ['disease1', 'disease_1', 'enfermedad 1', 'cbsd', 'brown_streak', 'estria parda'],
    tone: 'warn',
  },
  {
    key: 'disease2',
    label: 'Enfermedad 2',
    description: 'El modelo asocia la hoja con la segunda enfermedad configurada.',
    aliases: ['disease2', 'disease_2', 'enfermedad 2', 'cmd', 'mosaic', 'mosaico'],
    tone: 'danger',
  },
];

/**
 * Orden de las clases cuando el backend devuelve un arreglo de puntuaciones SIN etiquetas.
 * En el cuaderno de entrenamiento el orden alfabético de carpetas fue: cbsd, cmd, healthy.
 * Ajústalo si el backend usa otro orden. Si el backend devuelve etiquetas, este orden no se usa.
 */
export const UNLABELED_SCORE_ORDER: string[] = ['disease1', 'disease2', 'healthy'];
