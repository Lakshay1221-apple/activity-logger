import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';

interface TextLoggerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
}

export const TextLoggerModal: React.FC<TextLoggerModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useAppTheme();
  const [text, setText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave(trimmed);
      setText('');
      onClose();
    } catch (err) {
      console.error('[TextLoggerModal] Failed to save text log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setText('');
    onClose();
  };

  const canSave = text.trim().length > 0 && !isSubmitting;

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
              <View style={[styles.iconCircle, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.textPrimary} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Log Text
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

          {/* Text Input */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What are you doing or observing right now?"
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
            autoFocus
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
  textInput: {
    height: 140,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
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
