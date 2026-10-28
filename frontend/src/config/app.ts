import { env, envString } from './env';

export function publicAsset(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}

export const APP_CONFIG = {
  name: 'YucaAI',
  tagline: 'Detección de enfermedades en hojas de yuca',
  description: 'Identifica el estado de salud de una hoja de yuca mediante un modelo de inteligencia artificial ejecutado en el servidor.',
  version: '1.0.0',
  images: {
    plant: publicAsset(envString(env.VITE_IMAGE_PLANT, 'images/yuca.webp')),
    leaf: publicAsset(envString(env.VITE_IMAGE_LEAF, 'images/yuca_hoja.webp')),
  },
} as const;

export const IMAGE_RULES_DEFAULTS = {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
};
