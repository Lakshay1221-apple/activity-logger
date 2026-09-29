/**
 * Speech-to-Text Engine Abstraction Interfaces
 */

export interface TranscriptionSegment {
  text: string;
  t0: number; // start time in ms or seconds
  t1: number; // end time in ms or seconds
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  durationSeconds?: number;
  segments?: TranscriptionSegment[];
}

export interface SpeechToTextEngine {
  readonly id: string;
  readonly name: string;
  initialize(): Promise<void>;
  isAvailable(): Promise<boolean>;
  transcribe(audioPath: string, options?: { prompt?: string }): Promise<TranscriptionResult>;
  release?(): Promise<void>;
}
