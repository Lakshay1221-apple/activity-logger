import { SpeechToTextEngine } from '../../types/speech';
import { WhisperSpeechEngine } from './WhisperSpeechEngine';

let engineInstance: SpeechToTextEngine | null = null;

export function getSpeechToTextEngine(): SpeechToTextEngine {
  if (!engineInstance) {
    engineInstance = new WhisperSpeechEngine();
  }
  return engineInstance;
}

export { SpeechToTextEngine, WhisperSpeechEngine };
