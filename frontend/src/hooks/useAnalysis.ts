import { useCallback, useRef, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { predict } from '../services/yucaApi';
import type { ClassificationResult, RejectedImageResult } from '../types/domain';
import { toUserMessage } from '../utils/errors';
import type { SelectedImage } from './useImageSelection';

export type AnalysisPhase = 'idle' | 'uploading' | 'error';

export function useAnalysis() {
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [error, setError] = useState<string | undefined>();
  const [current, setCurrent] = useState<ClassificationResult | null>(null);
  const [rejected, setRejected] = useState<RejectedImageResult | null>(null);
  const ctrlRef = useRef<AbortController | null>(null); const busyRef = useRef(false);
  const run = useCallback(async (image: SelectedImage) => {
    if (busyRef.current) return; busyRef.current = true;
    const ctrl = new AbortController(); ctrlRef.current = ctrl; setPhase('uploading'); setError(undefined); setRejected(null);
    try {
      const res = await predict(image.file, ctrl.signal);
      if ('rejected' in res) {
        setRejected({ message: res.message, reason: res.reason, suggestions: res.suggestions });
        setCurrent(null); setPhase('idle'); return;
      }
      setCurrent({ createdAt: new Date().toISOString(), imageName: image.file.name, imageSize: image.file.size, imageType: image.file.type,
        imageWidth: image.width, imageHeight: image.height, previewUrl: image.previewUrl, modelLabel: API_CONFIG.modelName, modelReported: res.modelReported,
        predictedKey: res.predictedKey, predictedLabel: res.predictedLabel, predictedDerived: res.predictedDerived, scores: res.scores,
        scoreScale: res.scoreScale, scoreSum: res.scoreSum, warnings: res.warnings, latencyMs: res.latencyMs, backendInferenceMs: res.backendInferenceMs,
        reliable: res.reliable, recommendation: res.recommendation });
      setPhase('idle');
    } catch (err) { setError(toUserMessage(err)); setPhase('error'); }
    finally { busyRef.current = false; ctrlRef.current = null; }
  }, []);
  const cancel = useCallback(() => ctrlRef.current?.abort(), []);
  const resetCurrent = useCallback(() => { setCurrent(null); setRejected(null); setError(undefined); setPhase('idle'); }, []);
  return { phase, error, current, rejected, run, cancel, resetCurrent, setError };
}
