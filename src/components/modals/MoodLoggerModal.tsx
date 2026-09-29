import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEFAULT_MOOD_SCORE, getMoodConfig, MOOD_CONFIG } from '../../constants/mood';
import { useAppTheme } from '../../theme/ThemeProvider';

interface MoodLoggerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (score: number, label: string, reason: string) => Promise<void>;
}

export const MoodLoggerModal: React.FC<MoodLoggerModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useAppTheme();
  const [score, setScore] = useState<number>(DEFAULT_MOOD_SCORE);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentConfig = getMoodConfig(score);

  const canSave = reason.trim().length > 0 && !isSubmitting;

  const handleSave = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave(score, currentConfig.label, trimmedReason);
      setReason('');
      setScore(DEFAULT_MOOD_SCORE);
      onClose();
    } catch (err) {
      console.error('[MoodLoggerModal] Failed to save mood log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setScore(DEFAULT_MOOD_SCORE);
    onClose();
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
              <View style={[styles.iconCircle, { backgroundColor: `${currentConfig.color}20` }]}>
                <Ionicons name="heart" size={18} color={currentConfig.color} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Log Mood
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

          {/* Current Selection Spotlight */}
          <View
            style={[
              styles.spotlightCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={styles.spotlightEmoji}>{currentConfig.emoji}</Text>
            <View style={styles.spotlightTextContainer}>
              <Text style={[styles.spotlightScore, { color: currentConfig.color }]}>
                {currentConfig.score} / 10 — {currentConfig.label}
              </Text>
              <Text style={[styles.spotlightDesc, { color: colors.textSecondary }]}>
                {currentConfig.description}
              </Text>
            </View>
          </View>

          {/* 1 to 10 Selector Pills */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            SELECT RATING (1 – 10)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {Object.keys(MOOD_CONFIG).map((key) => {
              const num = Number(key);
              const isSelected = score === num;
              const itemConfig = MOOD_CONFIG[num];

              return (
                <TouchableOpacity
                  key={num}
                  onPress={() => setScore(num)}
                  style={[
                    styles.scorePill,
                    {
                      backgroundColor: isSelected
                        ? itemConfig.color
                        : colors.surfaceElevated,
                      borderColor: isSelected ? itemConfig.color : colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Mood rating ${num}, ${itemConfig.label}`}
                >
                  <Text
                    style={[
                      styles.scorePillText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Mandatory Reason Input */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>
            REASON (MANDATORY) *
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="What caused this feeling? (Why do you feel this way?)"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.textInput,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            multiline
            textAlignVertical="top"
          />

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                CANCEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              style={[
                styles.button,
                styles.saveButton,
                {
                  backgroundColor: canSave ? colors.textPrimary : colors.surfaceElevated,
                },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color: canSave ? colors.textInverse : colors.textMuted,
                  },
                ]}
              >
                SAVE
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  spotlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  spotlightEmoji: {
    fontSize: 28,
  },
  spotlightTextContainer: {
    flex: 1,
  },
  spotlightScore: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  spotlightDesc: {
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  scorePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePillText: {
    fontSize: 16,
    fontWeight: '700',
  },
  textInput: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
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
});
