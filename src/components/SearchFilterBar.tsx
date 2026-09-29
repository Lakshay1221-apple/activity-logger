import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { LogType } from '../types/log';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  activeFilter: LogType | 'all';
  onFilterChange: (filter: LogType | 'all') => void;
  isSearchVisible: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  isSearchVisible,
}) => {
  const { colors } = useAppTheme();

  const filterOptions: { key: LogType | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'ALL', icon: 'grid-outline' },
    { key: 'text', label: 'TEXT', icon: 'document-text-outline' },
    { key: 'voice', label: 'VOICE', icon: 'mic-outline' },
    { key: 'mood', label: 'MOOD', icon: 'heart-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isSearchVisible && (
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search text, voice, mood reasons..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filterOptions.map((item) => {
          const isActive = activeFilter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onFilterChange(item.key)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? colors.textPrimary : colors.surfaceElevated,
                  borderColor: isActive ? colors.textPrimary : colors.borderSubtle,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter by ${item.label}`}
            >
              <Ionicons
                name={item.icon as any}
                size={13}
                color={isActive ? colors.textInverse : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isActive ? colors.textInverse : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
