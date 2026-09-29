import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ExportOptions, ExportService } from '../../services/export/ExportService';
import { useAppTheme } from '../../theme/ThemeProvider';
import { ExportRangeType } from '../../types/log';
import { getDateKey } from '../../utils/date';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ visible, onClose }) => {
  const { colors } = useAppTheme();
  const todayKey = getDateKey(new Date());

  const [selectedRange, setSelectedRange] = useState<ExportRangeType>('today');
  const [customStart, setCustomStart] = useState<string>(todayKey);
  const [customEnd, setCustomEnd] = useState<string>(todayKey);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const rangeButtons: { key: ExportRangeType; label: string; desc: string }[] = [
    { key: 'today', label: 'Today', desc: 'All logs from today' },
    { key: 'last7days', label: 'Last 7 Days', desc: 'Logs from the past week' },
    { key: 'last30days', label: 'Last 30 Days', desc: 'Logs from the past month' },
    { key: 'custom', label: 'Custom Range', desc: 'Select start & end date' },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatusMessage('Generating offline JSON export...');

      const options: ExportOptions = {
        rangeType: selectedRange,
        customStartDate: selectedRange === 'custom' ? customStart : undefined,
        customEndDate: selectedRange === 'custom' ? customEnd : undefined,
      };

      const result = await ExportService.exportAndShare(options);
      setStatusMessage(`Export created successfully (${result.totalLogs} logs).`);

      setTimeout(() => {
        setIsExporting(false);
        setStatusMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('[ExportModal] Failed to export data:', err);
      setStatusMessage(`Export failed: ${err?.message || 'Unknown error'}`);
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
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
                <Ionicons name="share-outline" size={18} color={colors.textPrimary} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Export Data
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

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Export your raw activity logs as clean JSON. Completely offline, private, and ready for your personal AI analysis.
          </Text>

          {/* Range Options */}
          <View style={styles.optionsGrid}>
            {rangeButtons.map((btn) => {
              const isSelected = selectedRange === btn.key;
              return (
                <TouchableOpacity
                  key={btn.key}
                  onPress={() => setSelectedRange(btn.key)}
                  style={[
                    styles.rangeOption,
                    {
                      backgroundColor: isSelected
                        ? colors.accentSubtle
                        : colors.surfaceElevated,
                      borderColor: isSelected ? colors.accent : colors.borderSubtle,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.rangeTextCol}>
                    <Text
                      style={[
                        styles.rangeLabel,
                        { color: isSelected ? colors.accent : colors.textPrimary },
                      ]}
                    >
                      {btn.label}
                    </Text>
                    <Text style={[styles.rangeDesc, { color: colors.textMuted }]}>
                      {btn.desc}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? colors.accent : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Range Inputs */}
          {selectedRange === 'custom' && (
            <View style={[styles.customRow, { borderColor: colors.borderSubtle }]}>
              <View style={styles.customDateCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  START DATE (YYYY-MM-DD)
                </Text>
                <TextInput
                  value={customStart}
                  onChangeText={setCustomStart}
                  placeholder="2026-09-01"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.dateInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.customDateCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  END DATE (YYYY-MM-DD)
                </Text>
                <TextInput
                  value={customEnd}
                  onChangeText={setCustomEnd}
                  placeholder="2026-09-29"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.dateInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Status Message */}
          {statusMessage && (
            <View style={[styles.statusBox, { backgroundColor: colors.surfaceElevated }]}>
              {isExporting && (
                <ActivityIndicator
                  size="small"
                  color={colors.accent}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={[styles.statusText, { color: colors.textPrimary }]}>
                {statusMessage}
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isExporting}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExport}
              disabled={isExporting}
              style={[styles.button, styles.exportButton, { backgroundColor: colors.textPrimary }]}
            >
              <Ionicons
                name="download-outline"
                size={16}
                color={colors.textInverse}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.exportButtonText, { color: colors.textInverse }]}>
                {isExporting ? 'Exporting...' : 'Export JSON'}
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
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    fontSize: 18,
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
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  optionsGrid: {
    gap: 8,
    marginBottom: 14,
  },
  rangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  rangeTextCol: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  rangeDesc: {
    fontSize: 11,
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
  customDateCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dateInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
    flexDirection: 'row',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exportButton: {},
  exportButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
