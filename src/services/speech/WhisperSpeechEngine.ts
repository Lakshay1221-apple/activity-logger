import { Asset } from 'expo-asset';
import { initWhisper, WhisperContextInstance } from 'whisper.rn';
import { SpeechToTextEngine, TranscriptionResult } from '../../types/speech';

// Statically bundled quantized multilingual Whisper model
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MODEL_ASSET = require('../../../assets/models/ggml-tiny-q5_1.bin');

export class WhisperSpeechEngine implements SpeechToTextEngine {
  readonly id = 'whisper-offline-multilingual';
  readonly name = 'Whisper Offline ASR (Multilingual / Hinglish)';

  private context: WhisperContextInstance | null = null;
  private isInitializing: boolean = false;
  private initError: string | null = null;
  private modelFilePath: string | null = null;

  async isAvailable(): Promise<boolean> {
    return typeof initWhisper === 'function';
  }

  async initialize(): Promise<void> {
    if (this.context) {
      return;
    }
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (this.context) return;
    }

    this.isInitializing = true;
    this.initError = null;

    try {
      if (typeof initWhisper !== 'function') {
        throw new Error(
          'Native whisper.rn library is not available in the current runtime. Development build or prebuild is required for native offline inference.'
        );
      }

      // Resolve the bundled asset to a local file URI
      const [asset] = await Asset.loadAsync(MODEL_ASSET);
      if (!asset.localUri && !asset.uri) {
        throw new Error('Failed to resolve offline Whisper model asset.');
      }

      this.modelFilePath = asset.localUri || asset.uri;

      console.log('[WhisperSpeechEngine] Initializing Whisper with model:', this.modelFilePath);

      this.context = await initWhisper({
        filePath: this.modelFilePath,
        useGpu: true,
      });

      console.log(
        '[WhisperSpeechEngine] Successfully initialized WhisperContext (GPU:',
        this.context.gpu,
        ')'
      );
    } catch (err: any) {
      this.initError = err?.message || 'Failed to initialize Whisper engine';
      console.error('[WhisperSpeechEngine] Initialization error:', err);
      throw new Error(this.initError || 'Initialization error');
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Transcribe an offline audio file.
   * translate is strictly FALSE to preserve Hinglish code-switching naturally!
   */
  async transcribe(
    audioPath: string,
    options?: { prompt?: string }
  ): Promise<TranscriptionResult> {
    if (!this.context) {
      await this.initialize();
    }

    if (!this.context) {
      throw new Error(this.initError || 'Whisper context is not initialized');
    }

    const startTime = Date.now();

    // Bias prompt for natural code-switching Hindi/English/Hinglish
    const initialPrompt =
      options?.prompt ||
      'Preserve mixed Hindi and English speech (Hinglish). Do not translate. Keep words in spoken form.';

    try {
      console.log('[WhisperSpeechEngine] Transcribing audio file:', audioPath);

      const { promise } = this.context.transcribe(audioPath, {
        language: 'auto', // Auto-detect language
        translate: false, // CRITICAL: NEVER translate! Keep original language/Hinglish
        prompt: initialPrompt,
        maxThreads: 4,
      });

      const result = await promise;
      const durationSeconds = (Date.now() - startTime) / 1000;

      const cleanedText = (result.result || '').trim();

      console.log('[WhisperSpeechEngine] Transcription completed:', {
        text: cleanedText,
        detectedLanguage: result.language,
        durationSeconds,
      });

      return {
        text: cleanedText,
        language: result.language || 'auto',
        durationSeconds,
        segments: result.segments,
      };
    } catch (err: any) {
      console.error('[WhisperSpeechEngine] Transcription error:', err);
      throw new Error(`Offline transcription failed: ${err?.message || 'Unknown error'}`);
    }
  }

  async release(): Promise<void> {
    if (this.context && typeof this.context.release === 'function') {
      try {
        await this.context.release();
      } catch (err) {
        console.warn('[WhisperSpeechEngine] Error releasing context:', err);
      }
      this.context = null;
    }
  }
}
