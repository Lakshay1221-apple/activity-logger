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
import { getMoodConfig, MOOD_CONFIG } from '../../constants/mood';
import { useAppTheme } from '../../theme/ThemeProvider';
import {
  LogContent,
  LogEntry,
  MoodLogContent,
  TextLogContent,
  VoiceLogContent,
} from '../../types/log';

interface EditLogModalProps {
  item: LogEntry | null;
  visible: boolean;
  onClose: () => void;
  onSave: (id: string, newContent: LogContent) => Promise<void>;
}

const EditLogModalContent: React.FC<{
  item: LogEntry;
  visible: boolean;
  onClose: () => void;
  onSave: (id: string, newContent: LogContent) => Promise<void>;
}> = ({ item, visible, onClose, onSave }) => {
  const { colors } = useAppTheme();

  const [text, setText] = useState<string>(() => {
    if (item.type === 'text') return (item.content as TextLogContent).text;
    if (item.type === 'voice') return (item.content as VoiceLogContent).text;
    return '';
  });

  const [moodScore, setMoodScore] = useState<number>(() => {
    if (item.type === 'mood') return (item.content as MoodLogContent).score;
    return 5;
  });

  const [moodReason, setMoodReason] = useState<string>(() => {
    if (item.type === 'mood') return (item.content as MoodLogContent).reason;
    return '';
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentMoodConfig = getMoodConfig(moodScore);

  const canSave = () => {
    if (isSubmitting) return false;
    if (item.type === 'text' || item.type === 'voice') {
      return text.trim().length > 0;
    }
    if (item.type === 'mood') {
      return moodReason.trim().length > 0;
    }
    return false;
  };

  const handleSave = async () => {
    if (!canSave()) return;

    try {
      setIsSubmitting(true);
      let updatedContent: LogContent;

      if (item.type === 'text') {
        updatedContent = { text: text.trim() };
      } else if (item.type === 'voice') {
        const oldVoice = item.content as VoiceLogContent;
        updatedContent = {
          ...oldVoice,
          text: text.trim(),
        };
      } else {
        updatedContent = {
          score: moodScore,
          label: currentMoodConfig.label,
          reason: moodReason.trim(),
        };
      }

      await onSave(item.id, updatedContent);
      onClose();
    } catch (err) {
      console.error('[EditLogModal] Error saving edit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
              <View style={[styles.iconCircle, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name="pencil" size={16} color={colors.textPrimary} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Edit {item.type.toUpperCase()} Log
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body for Text / Voice */}
          {(item.type === 'text' || item.type === 'voice') && (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {item.type === 'voice' ? 'EDIT TRANSCRIPT' : 'CONTENT'}
              </Text>
              <TextInput
                value={text}
                onChangeText={setText}
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
            </View>
          )}

          {/* Body for Mood */}
          {item.type === 'mood' && (
            <View>
              {/* Spotlight */}
              <View
                style={[
                  styles.spotlightCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text style={styles.spotlightEmoji}>{currentMoodConfig.emoji}</Text>
                <View style={styles.spotlightTextContainer}>
                  <Text style={[styles.spotlightScore, { color: currentMoodConfig.color }]}>
                    {currentMoodConfig.score}/10 — {currentMoodConfig.label}
                  </Text>
                  <Text style={[styles.spotlightDesc, { color: colors.textSecondary }]}>
                    {currentMoodConfig.description}
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                CHANGE RATING
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsRow}
              >
                {Object.keys(MOOD_CONFIG).map((key) => {
                  const num = Number(key);
                  const isSelected = moodScore === num;
                  const itemConfig = MOOD_CONFIG[num];
                  return (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setMoodScore(num)}
                      style={[
                        styles.scorePill,
                        {
                          backgroundColor: isSelected
                            ? itemConfig.color
                            : colors.surfaceElevated,
                          borderColor: isSelected ? itemConfig.color : colors.border,
                        },
                      ]}
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

              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                REASON (MANDATORY) *
              </Text>
              <TextInput
                value={moodReason}
                onChangeText={setMoodReason}
                style={[
                  styles.reasonInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                CANCEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave()}
              style={[
                styles.button,
                styles.saveButton,
                {
                  backgroundColor: canSave() ? colors.textPrimary : colors.surfaceElevated,
                },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.saveButtonText,
                  { color: canSave() ? colors.textInverse : colors.textMuted },
                ]}
              >
                UPDATE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const EditLogModal: React.FC<EditLogModalProps> = ({
  item,
  visible,
  onClose,
  onSave,
}) => {
  if (!visible || !item) return null;
  return (
    <EditLogModalContent
      key={item.id}
      item={item}
      visible={visible}
      onClose={onClose}
      onSave={onSave}
    />
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  reasonInput: {
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  spotlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  spotlightEmoji: {
    fontSize: 24,
  },
  spotlightTextContainer: {
    flex: 1,
  },
  spotlightScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  spotlightDesc: {
    fontSize: 11,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  scorePill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePillText: {
    fontSize: 15,
    fontWeight: '700',
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
