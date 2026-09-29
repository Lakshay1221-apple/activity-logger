import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { useAppTheme } from '../../theme/ThemeProvider';

interface VoiceLoggerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string, durationSeconds: number) => Promise<void>;
}

export const VoiceLoggerModal: React.FC<VoiceLoggerModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useAppTheme();
  const {
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
  } = useAudioRecording();

  // Auto-start recording as soon as modal opens (Requirement 9)
  useEffect(() => {
    if (visible && phase === 'idle') {
      startRecording();
    }
  }, [visible, phase, startRecording]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCancel = async () => {
    await cancelRecording();
    onClose();
  };

  const handleDiscard = async () => {
    await discardRecording();
    onClose();
  };

  const handleSave = async () => {
    const trimmed = transcriptText.trim();
    if (!trimmed) return;

    await finalizeSave(async (text, duration) => {
      await onSave(text, duration);
    });

    onClose();
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.accentSubtle }]}>
                <Ionicons name="mic" size={18} color={colors.accent} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Voice Log
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* PERMISSION DENIED STATE */}
          {permissionDenied && (
            <View style={styles.stateContainer}>
              <View style={[styles.alertBox, { backgroundColor: colors.dangerSubtle }]}>
                <Ionicons name="warning-outline" size={24} color={colors.danger} />
                <Text style={[styles.alertText, { color: colors.dangerText }]}>
                  Microphone access is required to create voice logs.
                </Text>
              </View>
              <TouchableOpacity
                onPress={openSettings}
                style={[styles.actionButtonWide, { backgroundColor: colors.textPrimary }]}
              >
                <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>
                  Open System Settings
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelTextBtn}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE: RECORDING */}
          {!permissionDenied && phase === 'recording' && (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingStatusRow}>
                <View style={styles.pulsingDot} />
                <Text style={[styles.recordingStatusText, { color: colors.danger }]}>
                  Recording
                </Text>
              </View>

              <Text style={[styles.timerText, { color: colors.textPrimary }]}>
                {formatTimer(elapsedSeconds)}
              </Text>

              <Text style={[styles.promptHint, { color: colors.textSecondary }]}>
                Speak naturally in English, Hindi, or Hinglish...
              </Text>

              {/* Requirement 9: [ RED CANCEL ]   [ GREEN ✓ ] */}
              <View style={styles.recordControlsRow}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.controlCircleBtn, styles.redCancelBtn]}
                  accessibilityLabel="Cancel recording"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmRecording}
                  style={[styles.controlCircleBtn, styles.greenConfirmBtn]}
                  accessibilityLabel="Confirm recording"
                  accessibilityRole="button"
                >
                  <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PHASE: TRANSCRIBING */}
          {!permissionDenied && phase === 'transcribing' && (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.stateTitle, { color: colors.textPrimary, marginTop: 18 }]}>
                Transcribing...
              </Text>
              <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
                Running offline multilingual speech model on device
              </Text>
            </View>
          )}

          {/* PHASE: REVIEWING TRANSCRIPT */}
          {!permissionDenied && phase === 'reviewing' && (
            <View style={styles.reviewContainer}>
              <View style={styles.reviewHeaderRow}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  TRANSCRIPTION ({Math.round(recordedDuration)}s)
                </Text>
                <Text style={[styles.editHint, { color: colors.textMuted }]}>
                  Tap below to edit words if needed
                </Text>
              </View>

              <TextInput
                value={transcriptText}
                onChangeText={setTranscriptText}
                placeholder="Transcription text..."
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.reviewInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    DISCARD
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={transcriptText.trim().length === 0}
                  style={[
                    styles.button,
                    styles.saveButton,
                    {
                      backgroundColor:
                        transcriptText.trim().length > 0
                          ? colors.textPrimary
                          : colors.surfaceElevated,
                    },
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      {
                        color:
                          transcriptText.trim().length > 0
                            ? colors.textInverse
                            : colors.textMuted,
                      },
                    ]}
                  >
                    SAVE LOG
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PHASE: ERROR (FAILURE SAFETY) */}
          {!permissionDenied && phase === 'error' && (
            <View style={styles.stateContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <Text style={[styles.stateTitle, { color: colors.dangerText, marginTop: 12 }]}>
                Transcription Failed
              </Text>
              <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
                {errorMessage || 'An error occurred during offline transcription.'}
              </Text>
              <Text style={[styles.retentionNotice, { color: colors.textMuted }]}>
                Your audio is temporarily saved in memory. You can retry or discard.
              </Text>

              <View style={[styles.footer, { marginTop: 20 }]}>
                <TouchableOpacity
                  onPress={handleDiscard}
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    DISCARD
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={retryTranscription}
                  style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
                    RETRY
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    minHeight: 340,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  recordingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  recordingStatusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 2,
    marginVertical: 10,
    fontVariant: ['tabular-nums'],
  },
  promptHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  recordControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    marginTop: 6,
  },
  controlCircleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  redCancelBtn: {
    backgroundColor: '#DC2626',
  },
  greenConfirmBtn: {
    backgroundColor: '#16A34A',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  retentionNotice: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  reviewContainer: {
    paddingVertical: 4,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  editHint: {
    fontSize: 11,
  },
  reviewInput: {
    height: 130,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    width: '100%',
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionButtonWide: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelTextBtn: {
    padding: 8,
  },
});
