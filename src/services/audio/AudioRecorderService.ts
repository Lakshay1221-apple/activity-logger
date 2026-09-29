import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { File } from 'expo-file-system';

export class AudioRecorderService {
  /**
   * Checks current microphone permission status.
   */
  static async checkPermission(): Promise<boolean> {
    try {
      const response = await getRecordingPermissionsAsync();
      return response.granted;
    } catch (err) {
      console.warn('[AudioRecorderService] Error checking permission:', err);
      return false;
    }
  }

  /**
   * Prompts the user for microphone recording permission.
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const response = await requestRecordingPermissionsAsync();
      return response.granted;
    } catch (err) {
      console.error('[AudioRecorderService] Error requesting permission:', err);
      return false;
    }
  }

  /**
   * Configures global audio mode for reliable voice logging.
   */
  static async configureAudioSession(): Promise<void> {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
      });
    } catch (err) {
      console.warn('[AudioRecorderService] Failed to configure audio session:', err);
    }
  }

  /**
   * Permanently deletes a temporary audio file.
   * Audio files are NEVER retained after cancellation, discard, or successful save.
   */
  static async deleteTemporaryAudio(fileUri: string | null | undefined): Promise<void> {
    if (!fileUri) return;
    try {
      const file = new File(fileUri);
      if (file.exists) {
        file.delete();
        console.log('[AudioRecorderService] Temporary audio file deleted successfully:', fileUri);
      }
    } catch (err) {
      console.warn('[AudioRecorderService] Failed to delete temporary audio file:', err);
    }
  }
}
