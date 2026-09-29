import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';
import { LogEntry } from '../../types/log';

interface DeleteConfirmModalProps {
  item: LogEntry | null;
  visible: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  visible,
  onClose,
  onConfirmDelete,
}) => {
  const { colors } = useAppTheme();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!item) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(item.id);
      onClose();
    } catch (err) {
      console.error('[DeleteConfirmModal] Error deleting log:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialogContainer,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.dangerSubtle }]}>
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
          </View>

          <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>
            Delete this log?
          </Text>
          <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>
            This action will permanently delete this {item.type} entry from your local device.
          </Text>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting}
              style={[styles.button, styles.deleteButton, { backgroundColor: colors.danger }]}
              accessibilityRole="button"
            >
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {},
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
