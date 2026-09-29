import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { LogEntry } from '../types/log';
import { TimelineItem } from './TimelineItem';

interface TimelineListProps {
  logs: LogEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  onEdit: (item: LogEntry) => void;
  onDelete: (item: LogEntry) => void;
  isSearching: boolean;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  logs,
  isLoading,
  onRefresh,
  onEdit,
  onDelete,
  isSearching,
}) => {
  const { colors } = useAppTheme();

  const renderItem = useCallback(
    ({ item }: { item: LogEntry }) => (
      <TimelineItem item={item} onEdit={onEdit} onDelete={onDelete} />
    ),
    [onEdit, onDelete]
  );

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Loading offline logs...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceElevated }]}>
          <Ionicons
            name={isSearching ? 'search-outline' : 'journal-outline'}
            size={32}
            color={colors.textMuted}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          {isSearching ? 'No matching logs found' : 'No logs for this day'}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {isSearching
            ? 'Try changing your search term or filter'
            : 'Tap the + button below to log text, mood, or voice'}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={logs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[
        styles.listContent,
        logs.length === 0 && styles.listContentEmpty,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      ListEmptyComponent={renderEmptyComponent}
      showsVerticalScrollIndicator={false}
      initialNumToRender={15}
      maxToRenderPerBatch={20}
      windowSize={11}
      removeClippedSubviews={true}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 12,
    paddingBottom: 100, // Extra space for floating plus button
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
