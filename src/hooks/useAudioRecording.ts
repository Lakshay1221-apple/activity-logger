import { RecordingPresets, useAudioRecorder } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioRecorderService } from '../services/audio/AudioRecorderService';
import { getSpeechToTextEngine } from '../services/speech';

export type RecordingPhase =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'reviewing'
  | 'error';

export function useAudioRecording() {
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tempAudioUriRef = useRef<string | null>(null);

  // Initialize expo-audio recorder with HIGH_QUALITY preset (stores in cache directory)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      // Ensure any abandoned temp audio is cleaned up
      if (tempAudioUriRef.current) {
        AudioRecorderService.deleteTemporaryAudio(tempAudioUriRef.current);
      }
    };
  }, []);

  /**
   * Start recording immediately.
   */
  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      setPermissionDenied(false);

      const hasPermission = await AudioRecorderService.checkPermission();
      if (!hasPermission) {
        const granted = await AudioRecorderService.requestPermission();
        if (!granted) {
          setPermissionDenied(true);
          setErrorMessage('Microphone access is required to create voice logs.');
          return false;
        }
      }

      await AudioRecorderService.configureAudioSession();

      // Clear any prior temp file
      if (tempAudioUriRef.current) {
        await AudioRecorderService.deleteTemporaryAudio(tempAudioUriRef.current);
        tempAudioUriRef.current = null;
      }

      await recorder.prepareToRecordAsync();
      recorder.record();

      setElapsedSeconds(0);
      setPhase('recording');

      clearTimer();
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      return true;
    } catch (err: any) {
      console.error('[useAudioRecording] Failed to start recording:', err);
      setErrorMessage(err?.message || 'Failed to start recording');
      setPhase('idle');
      return false;
    }
  }, [recorder]);

  /**
   * Cancel recording flow (Red Cancel button).
   * Stops recording, deletes temporary audio immediately, does NOT transcribe.
   */
  const cancelRecording = useCallback(async () => {
    clearTimer();
    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }
    } catch (err) {
      console.warn('[useAudioRecording] Error stopping on cancel:', err);
    }

    const uri = recorder.uri || tempAudioUriRef.current;
    if (uri) {
      await AudioRecorderService.deleteTemporaryAudio(uri);
    }

    tempAudioUriRef.current = null;
    setElapsedSeconds(0);
    setRecordedDuration(0);
    setTranscriptText('');
    setErrorMessage(null);
    setPhase('idle');
  }, [recorder]);

  /**
   * Confirm recording flow (Green Check button).
   * Stops recording, sends temporary audio to offline STT.
   */
  const confirmRecording = useCallback(async () => {
    clearTimer();
    const finalDuration = elapsedSeconds;
    setRecordedDuration(finalDuration);

    let audioUri: string | null = null;
    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }
      audioUri = recorder.uri;
      tempAudioUriRef.current = audioUri;
    } catch (err) {
      console.error('[useAudioRecording] Error stopping recording on confirm:', err);
    }

    if (!audioUri) {
      setErrorMessage('No recorded audio file found.');
      setPhase('error');
      return;
    }

    setPhase('transcribing');

    try {
      const speechEngine = getSpeechToTextEngine();
      const result = await speechEngine.transcribe(audioUri);

      const text = result.text.trim();
      setTranscriptText(text);
      setPhase('reviewing');
    } catch (err: any) {
      console.error('[useAudioRecording] Transcription failed:', err);
      setErrorMessage(err?.message || 'Transcription failed. Please try again.');
      setPhase('error');
      // Temporary audio is safely retained for RETRY option
    }
  }, [elapsedSeconds, recorder]);

  /**
   * Retry transcription with existing temporary audio.
   */
  const retryTranscription = useCallback(async () => {
    const audioUri = tempAudioUriRef.current;
    if (!audioUri) {
      setErrorMessage('Original recording is no longer available.');
      setPhase('idle');
      return;
    }

    setPhase('transcribing');
    setErrorMessage(null);

    try {
      const speechEngine = getSpeechToTextEngine();
      const result = await speechEngine.transcribe(audioUri);
      setTranscriptText(result.text.trim());
      setPhase('reviewing');
    } catch (err: any) {
      console.error('[useAudioRecording] Retry transcription failed:', err);
      setErrorMessage(err?.message || 'Transcription failed again.');
      setPhase('error');
    }
  }, []);

  /**
   * Discard recording after failure.
   */
  const discardRecording = useCallback(async () => {
    if (tempAudioUriRef.current) {
      await AudioRecorderService.deleteTemporaryAudio(tempAudioUriRef.current);
      tempAudioUriRef.current = null;
    }
    setPhase('idle');
    setTranscriptText('');
    setErrorMessage(null);
    setElapsedSeconds(0);
    setRecordedDuration(0);
  }, []);

  /**
   * Save confirmed voice log.
   * Inserts log, then immediately deletes temporary audio file.
   */
  const finalizeSave = useCallback(
    async (saveCallback: (text: string, durationSeconds: number) => Promise<void>) => {
      try {
        await saveCallback(transcriptText, recordedDuration);

        // Delete temporary audio permanently
        if (tempAudioUriRef.current) {
          await AudioRecorderService.deleteTemporaryAudio(tempAudioUriRef.current);
          tempAudioUriRef.current = null;
        }

        setPhase('idle');
        setTranscriptText('');
        setElapsedSeconds(0);
        setRecordedDuration(0);
      } catch (err: any) {
        console.error('[useAudioRecording] Failed to save voice log:', err);
        setErrorMessage(err?.message || 'Failed to save log to database.');
      }
    },
    [transcriptText, recordedDuration]
  );

  return {
    phase,
    elapsedSeconds,
    recordedDuration,
    transcriptText,
    setTranscriptText,
    errorMessage,
    permissionDenied,
    startRecording,
    cancelRecording,
    confirmRecording,
    retryTranscription,
    discardRecording,
    finalizeSave,
  };
}
