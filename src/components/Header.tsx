import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

interface HeaderProps {
  totalCount: number;
  isSearchActive: boolean;
  onToggleSearch: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  isSearchActive,
  onToggleSearch,
  onOpenExport,
}) => {
  const { colors, themePreference, setThemePreference, isDark } = useAppTheme();

  const toggleTheme = () => {
    if (themePreference === 'system') {
      setThemePreference('dark');
    } else if (themePreference === 'dark') {
      setThemePreference('light');
    } else {
      setThemePreference('system');
    }
  };

  const getThemeIcon = () => {
    if (themePreference === 'system') return 'phone-portrait-outline';
    return isDark ? 'moon-outline' : 'sunny-outline';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>LOGGER</Text>
        <View style={[styles.badge, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.badgeText, { color: colors.textMuted }]}>
            {totalCount} {totalCount === 1 ? 'log' : 'logs'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onToggleSearch}
          style={[
            styles.actionButton,
            {
              backgroundColor: isSearchActive
                ? colors.accentSubtle
                : colors.surfaceElevated,
            },
          ]}
          accessibilityLabel="Search logs"
          accessibilityRole="button"
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isSearchActive ? colors.accent : colors.textPrimary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.actionButton, { backgroundColor: colors.surfaceElevated }]}
          accessibilityLabel={`Toggle theme (currently ${themePreference})`}
          accessibilityRole="button"
        >
          <Ionicons name={getThemeIcon()} size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenExport}
          style={[styles.actionButton, { backgroundColor: colors.surfaceElevated }]}
          accessibilityLabel="Export logs as JSON"
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
