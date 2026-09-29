declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.bin' {
  const content: number;
  export default content;
}

declare module 'whisper.rn' {
  export interface TranscribeOptions {
    language?: string;
    translate?: boolean;
    maxThreads?: number;
    prompt?: string;
    onProgress?: (progress: number) => void;
  }

  export interface TranscribeResult {
    result: string;
    language: string;
    segments: {
      text: string;
      t0: number;
      t1: number;
    }[];
    isAborted: boolean;
  }

  export interface WhisperContextOptions {
    filePath: string | number;
    useGpu?: boolean;
    isBundleAsset?: boolean;
  }

  export interface WhisperContextInstance {
    gpu: boolean;
    reasonNoGPU: string;
    transcribe(
      filePathOrBase64: string | number,
      options?: TranscribeOptions
    ): {
      stop: () => Promise<void>;
      promise: Promise<TranscribeResult>;
    };
    release(): Promise<void>;
  }

  export function initWhisper(options: WhisperContextOptions): Promise<WhisperContextInstance>;
  export function releaseAllWhisper(): Promise<void>;
}
