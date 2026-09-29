import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateNavigator } from '../components/DateNavigator';
import { FloatingPlusButton } from '../components/FloatingPlusButton';
import { Header } from '../components/Header';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { EditLogModal } from '../components/modals/EditLogModal';
import { ExportModal } from '../components/modals/ExportModal';
import { MoodLoggerModal } from '../components/modals/MoodLoggerModal';
import { TextLoggerModal } from '../components/modals/TextLoggerModal';
import { VoiceLoggerModal } from '../components/modals/VoiceLoggerModal';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { TimelineList } from '../components/TimelineList';
import { useLogs } from '../hooks/useLogs';
import { useAppTheme } from '../theme/ThemeProvider';
import {
  LogContent,
  LogEntry,
  LogType,
  MoodLogContent,
  TextLogContent,
  VoiceLogContent,
} from '../types/log';

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const {
    logs,
    isLoading,
    selectedDate,
    isToday,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    totalCount,
    refreshLogs,
    createLog,
    updateLog,
    deleteLog,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = useLogs();

  // Search UI toggle
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);

  // Modals visibility
  const [isTextModalOpen, setIsTextModalOpen] = useState<boolean>(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Edit & Delete targets
  const [editingItem, setEditingItem] = useState<LogEntry | null>(null);
  const [deletingItem, setDeletingItem] = useState<LogEntry | null>(null);

  const handleSelectLogType = (type: LogType) => {
    switch (type) {
      case 'text':
        setIsTextModalOpen(true);
        break;
      case 'mood':
        setIsMoodModalOpen(true);
        break;
      case 'voice':
        setIsVoiceModalOpen(true);
        break;
    }
  };

  // Handlers for creating logs
  const handleSaveText = async (text: string) => {
    const content: TextLogContent = { text };
    await createLog('text', content);
  };

  const handleSaveMood = async (score: number, label: string, reason: string) => {
    const content: MoodLogContent = { score, label, reason };
    await createLog('mood', content);
  };

  const handleSaveVoice = async (text: string, durationSeconds: number) => {
    const content: VoiceLogContent = { text, durationSeconds };
    await createLog('voice', content);
  };

  const handleUpdateLog = async (id: string, newContent: LogContent) => {
    await updateLog(id, newContent);
  };

  const handleConfirmDelete = async (id: string) => {
    await deleteLog(id);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* App Header */}
      <Header
        totalCount={totalCount}
        isSearchActive={isSearchVisible}
        onToggleSearch={() => setIsSearchVisible((prev) => !prev)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Date Navigation Bar (hidden during search) */}
      {!isSearchVisible && (
        <DateNavigator
          selectedDate={selectedDate}
          isToday={isToday}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
          onToday={goToToday}
        />
      )}

      {/* Search Input & Type Filter Pills */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={typeFilter}
        onFilterChange={setTypeFilter}
        isSearchVisible={isSearchVisible}
      />

      {/* Chronological Timeline List */}
      <TimelineList
        logs={logs}
        isLoading={isLoading}
        onRefresh={refreshLogs}
        onEdit={(item) => setEditingItem(item)}
        onDelete={(item) => setDeletingItem(item)}
        isSearching={searchQuery.trim().length > 0}
      />

      {/* Prominent Floating Plus Button */}
      <FloatingPlusButton onSelectType={handleSelectLogType} />

      {/* Creation Modals */}
      <TextLoggerModal
        visible={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onSave={handleSaveText}
      />

      <MoodLoggerModal
        visible={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSave={handleSaveMood}
      />

      <VoiceLoggerModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSave={handleSaveVoice}
      />

      {/* Edit Modal */}
      <EditLogModal
        item={editingItem}
        visible={editingItem !== null}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdateLog}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        item={deletingItem}
        visible={deletingItem !== null}
        onClose={() => setDeletingItem(null)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Export Modal */}
      <ExportModal
        visible={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
