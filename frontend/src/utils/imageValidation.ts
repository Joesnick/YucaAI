import { IMAGE_RULES_DEFAULTS } from '../config/app';

export interface ValidatedImage { file: File; width: number; height: number; }
export type ValidationResult = { ok: true; image: ValidatedImage } | { ok: false; errors: string[] };
const extOf = (name: string) => name.slice(name.lastIndexOf('.')).toLowerCase();

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Acepta imágenes de cualquier tamaño: solo valida formato y decodificación. */
export async function validateImage(file: File): Promise<ValidationResult> {
  const errors: string[] = []; const ext = extOf(file.name);
  const heic = file.type === 'image/heic' || file.type === 'image/heif' || ['.heic', '.heif'].includes(ext);
  if (heic) errors.push('El formato HEIC/HEIF no es compatible. En iPhone, usa “Más compatible” o exporta la foto como JPEG.');
  else {
    if (!(IMAGE_RULES_DEFAULTS.allowedMimeTypes as readonly string[]).includes(file.type)) errors.push(`Tipo de archivo no permitido (${file.type || 'desconocido'}). Usa JPEG, PNG o WebP.`);
    if (!(IMAGE_RULES_DEFAULTS.allowedExtensions as readonly string[]).includes(ext)) errors.push(`Extensión no permitida (${ext || 'sin extensión'}). Usa .jpg, .jpeg, .png o .webp.`);
  }
  if (file.size === 0) errors.push('El archivo está vacío.');
  if (errors.length) return { ok: false, errors };
  try { return { ok: true, image: { file, ...(await readDimensions(file)) } }; }
  catch { return { ok: false, errors: ['No se pudo leer la imagen. El archivo puede estar dañado o no ser una imagen válida.'] }; }
}
