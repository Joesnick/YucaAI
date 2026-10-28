import { useCallback, useEffect, useRef, useState } from 'react';
import { validateImage } from '../utils/imageValidation';

export interface SelectedImage { file: File; width: number; height: number; previewUrl: string; }

/** Selección local, temporal y sin transformación del archivo. */
export function useImageSelection() {
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);
  const urlRef = useRef<string | null>(null);
  const revoke = useCallback(() => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); urlRef.current = null; }, []);
  const selectFile = useCallback(async (file: File | undefined | null) => {
    if (!file) return; setValidating(true); setErrors([]);
    const res = await validateImage(file); setValidating(false);
    if (!res.ok) { setErrors(res.errors); return; }
    revoke(); const previewUrl = URL.createObjectURL(file); urlRef.current = previewUrl;
    setImage({ ...res.image, previewUrl });
  }, [revoke]);
  const clear = useCallback(() => { revoke(); setImage(null); setErrors([]); }, [revoke]);
  useEffect(() => () => revoke(), [revoke]);
  return { image, errors, validating, selectFile, clear, setErrors };
}
