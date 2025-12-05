import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'innovative';
  icon: LucideIcon;
  openSourceSolution: string; // The underlying tech (e.g., FFmpeg.wasm)
  isAiPowered?: boolean;
}

export interface VideoStats {
  duration: string;
  format: string;
  size: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type VideoProcessingMode = 'trim' | 'merge' | 'convert' | 'compress' | 'rotate';
