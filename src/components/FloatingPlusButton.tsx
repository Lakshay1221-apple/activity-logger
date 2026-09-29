import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { LogType } from '../types/log';

interface FloatingPlusButtonProps {
  onSelectType: (type: LogType) => void;
}

export const FloatingPlusButton: React.FC<FloatingPlusButtonProps> = ({ onSelectType }) => {
  const { colors } = useAppTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSelect = (type: LogType) => {
    setIsOpen(false);
    onSelectType(type);
  };

  const options: {
    type: LogType;
    title: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
  }[] = [
    {
      type: 'text',
      title: 'TEXT',
      description: 'Quick notes, activity logs, reflections',
      icon: 'document-text',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      type: 'mood',
      title: 'MOOD',
      description: '1–10 rating with mandatory context/reason',
      icon: 'heart',
      color: '#EC4899',
      bgColor: '#FDF2F8',
    },
    {
      type: 'voice',
      title: 'VOICE',
      description: 'Hands-free offline speech-to-text recording',
      icon: 'mic',
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
  ];

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={[styles.fab, { backgroundColor: colors.textPrimary }]}
        activeOpacity={0.85}
        accessibilityLabel="Create new log"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={32} color={colors.textInverse} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.sheetContainer,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                    New Log Entry
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsOpen(false)}
                    style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionsList}>
                  {options.map((opt) => (
                    <TouchableOpacity
                      key={opt.type}
                      onPress={() => handleSelect(opt.type)}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.iconBox, { backgroundColor: opt.bgColor }]}>
                        <Ionicons name={opt.icon as any} size={22} color={opt.color} />
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                          {opt.title}
                        </Text>
                        <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                          {opt.description}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
  },
});
