import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityTabs } from '../components/ActivityTabs';
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
import { LogContent, LogEntry, LogType, MoodLogContent, TextLogContent, VoiceLogContent } from '../types/log';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { logs, isLoading, selectedDate, isToday, typeFilter, setTypeFilter, searchQuery, setSearchQuery, totalCount, refreshLogs, createLog, updateLog, deleteLog, goToPreviousDay, goToNextDay, goToToday } = useLogs();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LogEntry | null>(null);
  const [deletingItem, setDeletingItem] = useState<LogEntry | null>(null);

  const handleSelectLogType = (type: LogType) => {
    if (type === 'text') setIsTextModalOpen(true);
    if (type === 'mood') setIsMoodModalOpen(true);
    if (type === 'voice') setIsVoiceModalOpen(true);
  };
  const handleSaveText = async (text: string) => { await createLog('text', { text } satisfies TextLogContent); };
  const handleSaveMood = async (score: number, label: string, reason: string) => { await createLog('mood', { score, label, reason } satisfies MoodLogContent); };
  const handleSaveVoice = async (text: string, durationSeconds: number) => { await createLog('voice', { text, durationSeconds } satisfies VoiceLogContent); };
  const handleUpdateLog = async (id: string, content: LogContent) => { await updateLog(id, content); };
  const handleConfirmDelete = async (id: string) => { await deleteLog(id); };

  return <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
    <Header totalCount={totalCount} isSearchActive={isSearchVisible} onToggleSearch={() => setIsSearchVisible((previous) => !previous)} onOpenExport={() => setIsExportModalOpen(true)} />
    {!isSearchVisible && <DateNavigator selectedDate={selectedDate} isToday={isToday} onPreviousDay={goToPreviousDay} onNextDay={goToNextDay} onToday={goToToday} />}
    <SearchFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} activeFilter={typeFilter} onFilterChange={setTypeFilter} isSearchVisible={isSearchVisible} />
    <TimelineList logs={logs} isLoading={isLoading} onRefresh={refreshLogs} onEdit={setEditingItem} onDelete={setDeletingItem} isSearching={searchQuery.trim().length > 0} />
    <FloatingPlusButton onSelectType={handleSelectLogType} />
    <TextLoggerModal visible={isTextModalOpen} onClose={() => setIsTextModalOpen(false)} onSave={handleSaveText} />
    <MoodLoggerModal visible={isMoodModalOpen} onClose={() => setIsMoodModalOpen(false)} onSave={handleSaveMood} />
    <VoiceLoggerModal visible={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onSave={handleSaveVoice} />
    <EditLogModal item={editingItem} visible={editingItem !== null} onClose={() => setEditingItem(null)} onSave={handleUpdateLog} />
    <DeleteConfirmModal item={deletingItem} visible={deletingItem !== null} onClose={() => setDeletingItem(null)} onConfirmDelete={handleConfirmDelete} />
    <ExportModal visible={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    <ActivityTabs />
  </View>;
}
const styles = StyleSheet.create({ root: { flex: 1 } });
