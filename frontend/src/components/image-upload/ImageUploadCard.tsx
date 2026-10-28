import { Camera, ImagePlus, ImageUp, RefreshCcw, Trash2 } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { APP_CONFIG, IMAGE_RULES_DEFAULTS } from '../../config/app';
import { useApp } from '../../context/AppContext';
import { formatBytes } from '../../utils/imageValidation';
import { Alert } from '../common/Alert';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

const ACCEPT = IMAGE_RULES_DEFAULTS.allowedMimeTypes.join(',');
export function ImageUploadCard() {
  const { imageApi, analysis, selectImage } = useApp(); const { image, errors, validating, clear } = imageApi;
  const fileRef = useRef<HTMLInputElement>(null); const cameraRef = useRef<HTMLInputElement>(null); const [dragging, setDragging] = useState(false); const busy = analysis.phase === 'uploading';
  const onDrop = (event: DragEvent) => { event.preventDefault(); setDragging(false); if (busy) return; const files = event.dataTransfer.files; if (files.length !== 1) imageApi.setErrors(['Arrastra una sola imagen a la vez.']); else selectImage(files[0]); };
  return <Card id="imagen" title="Imagen de la hoja de yuca" icon={ImagePlus}><div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-stretch">
    <div onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-white/5'}`}>
      {image ? <figure className="flex h-full w-full flex-col"><img src={image.previewUrl} alt={`Vista previa de la fotografía seleccionada: ${image.file.name}`} className="max-h-[320px] w-full flex-1 object-contain" /><figcaption className="flex flex-wrap items-center justify-between gap-1 border-t border-slate-200 bg-white/90 px-3 py-2 text-xs dark:border-white/10 dark:bg-black/30"><span className="truncate font-medium">{image.file.name}</span><span className="muted">{image.width}×{image.height}px · {formatBytes(image.file.size)} · Lista para analizar</span></figcaption></figure> : <figure className="relative h-full w-full"><img src={APP_CONFIG.images.leaf} alt="Hoja de yuca de ejemplo (imagen ilustrativa, no se envía al servidor)" className="h-full max-h-[320px] w-full object-cover opacity-90" /><figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10 text-center text-white"><span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">Imagen ilustrativa</span><span className="text-sm">Arrastra aquí la fotografía de tu hoja</span></figcaption></figure>}
      {validating && <div className="absolute inset-0 grid place-items-center bg-white/70 dark:bg-black/50" role="status"><span className="flex items-center gap-2 text-sm font-medium"><Spinner /> Validando imagen…</span></div>}
    </div><div className="flex flex-col justify-center gap-3"><div className="text-center md:text-left"><ImageUp aria-hidden className="mx-auto h-8 w-8 text-brand-700 md:mx-0 dark:text-brand-300" /><p className="mt-2 font-semibold">{image ? 'Imagen seleccionada' : 'Sube una imagen o toma una foto'}</p><p className="muted text-sm">Usa una foto nítida de una sola hoja, con buena luz.</p></div>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2"><button type="button" className="btn-primary min-h-[48px]" disabled={busy} onClick={() => fileRef.current?.click()}>{image ? <RefreshCcw aria-hidden className="h-4 w-4" /> : <ImageUp aria-hidden className="h-4 w-4" />}{image ? 'Cambiar imagen' : 'Subir imagen'}</button><button type="button" className="btn-outline min-h-[48px]" disabled={busy} onClick={() => cameraRef.current?.click()}><Camera aria-hidden className="h-4 w-4" />Tomar foto</button></div>
      {image && <button type="button" className="btn-ghost self-center text-sm md:self-start" disabled={busy} onClick={clear}><Trash2 aria-hidden className="h-4 w-4" /> Quitar imagen</button>}
      <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label="Seleccionar imagen de la hoja" onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ''; }} />
      <input ref={cameraRef} type="file" accept={ACCEPT} capture="environment" className="sr-only" tabIndex={-1} aria-label="Tomar foto de la hoja" onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ''; }} />
      <dl className="muted grid grid-cols-[auto_1fr] gap-x-2 text-xs"><dt>Formatos permitidos:</dt><dd>JPEG, PNG, WebP</dd></dl>
    </div></div>{errors.length > 0 && <Alert variant="error" title="La imagen no es válida" className="mt-4"><ul className="list-disc pl-4">{errors.map((error) => <li key={error}>{error}</li>)}</ul></Alert>}</Card>;
}
