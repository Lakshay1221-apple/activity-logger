import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { formatDayHeader } from '../utils/date';

interface DateNavigatorProps {
  selectedDate: string;
  isToday: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  isToday,
  onPreviousDay,
  onNextDay,
  onToday,
}) => {
  const { colors } = useAppTheme();
  const { title, subtitle } = formatDayHeader(selectedDate);

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderSubtle }]}>
      <TouchableOpacity
        onPress={onPreviousDay}
        style={[styles.arrowButton, { backgroundColor: colors.surfaceElevated }]}
        accessibilityLabel="Previous day"
        accessibilityRole="button"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToday}
        style={styles.dateCenter}
        activeOpacity={0.7}
        accessibilityLabel={`Selected date: ${title}, ${subtitle}`}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {!isToday && (
            <View style={[styles.todayBadge, { backgroundColor: colors.accentSubtle }]}>
              <Text style={[styles.todayBadgeText, { color: colors.accentText }]}>
                Jump to Today
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNextDay}
        style={[styles.arrowButton, { backgroundColor: colors.surfaceElevated }]}
        accessibilityLabel="Next day"
        accessibilityRole="button"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
