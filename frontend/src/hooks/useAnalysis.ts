import { useCallback, useRef, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { predict } from '../services/yucaApi';
import type { ClassificationResult } from '../types/domain';
import { toUserMessage } from '../utils/errors';
import type { SelectedImage } from './useImageSelection';

export type AnalysisPhase = 'idle' | 'uploading' | 'error';

export function useAnalysis() {
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [error, setError] = useState<string | undefined>();
  const [current, setCurrent] = useState<ClassificationResult | null>(null);
  const ctrlRef = useRef<AbortController | null>(null); const busyRef = useRef(false);
  const run = useCallback(async (image: SelectedImage) => {
    if (busyRef.current) return; busyRef.current = true;
    const ctrl = new AbortController(); ctrlRef.current = ctrl; setPhase('uploading'); setError(undefined);
    try {
      const res = await predict(image.file, ctrl.signal);
      setCurrent({ createdAt: new Date().toISOString(), imageName: image.file.name, imageSize: image.file.size, imageType: image.file.type,
        imageWidth: image.width, imageHeight: image.height, previewUrl: image.previewUrl, modelLabel: API_CONFIG.modelName, modelReported: res.modelReported,
        predictedKey: res.predictedKey, predictedLabel: res.predictedLabel, predictedDerived: res.predictedDerived, scores: res.scores,
        scoreScale: res.scoreScale, scoreSum: res.scoreSum, warnings: res.warnings, latencyMs: res.latencyMs, backendInferenceMs: res.backendInferenceMs });
      setPhase('idle');
    } catch (err) { setError(toUserMessage(err)); setPhase('error'); }
    finally { busyRef.current = false; ctrlRef.current = null; }
  }, []);
  const cancel = useCallback(() => ctrlRef.current?.abort(), []);
  const resetCurrent = useCallback(() => { setCurrent(null); setError(undefined); setPhase('idle'); }, []);
  return { phase, error, current, run, cancel, resetCurrent, setError };
}
