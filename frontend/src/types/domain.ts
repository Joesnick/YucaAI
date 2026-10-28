export type ClassKey = 'healthy' | 'disease1' | 'disease2';
export type Tone = 'healthy' | 'warn' | 'danger';
export interface ClassDefinition { key: ClassKey; label: string; description: string; aliases: string[]; tone: Tone; }
export interface ClassScore { key: ClassKey; label: string; score: number; rawValue: number; rawLabel: string; }
export interface ClassificationResult {
  createdAt: string; imageName: string; imageSize: number; imageType: string; imageWidth?: number; imageHeight?: number; previewUrl: string;
  modelLabel: string; modelReported?: string; predictedKey: ClassKey; predictedLabel: string; predictedDerived: boolean;
  scores: ClassScore[]; scoreScale: 'probability' | 'percent'; scoreSum: number; warnings: string[]; latencyMs: number; backendInferenceMs?: number;
  reliable?: boolean; recommendation?: string;
}
export interface RejectedImageResult { message: string; reason?: string; suggestions: string[]; }
export type BackendStatus =
  | { state: 'not-configured' } | { state: 'checking' }
  | { state: 'online'; checkedAt: string; info?: Record<string, unknown> }
  | { state: 'offline'; checkedAt: string; message: string };
