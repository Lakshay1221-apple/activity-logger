import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getMoodConfig } from '../constants/mood';
import { useAppTheme } from '../theme/ThemeProvider';
import { LogEntry, MoodLogContent, TextLogContent, VoiceLogContent } from '../types/log';
import { formatDisplayTime } from '../utils/date';

interface TimelineItemProps {
  item: LogEntry;
  onEdit: (item: LogEntry) => void;
  onDelete: (item: LogEntry) => void;
}

export const TimelineItem = memo(function TimelineItem({
  item,
  onEdit,
  onDelete,
}: TimelineItemProps) {
  const { colors } = useAppTheme();
  const displayTime = formatDisplayTime(item.timestamp);

  const getTypeMeta = () => {
    switch (item.type) {
      case 'text':
        return {
          icon: 'document-text-outline',
          label: 'Text',
          color: colors.textSecondary,
          accentBg: colors.surfaceElevated,
        };
      case 'voice':
        return {
          icon: 'mic-outline',
          label: 'Voice',
          color: colors.accent,
          accentBg: colors.accentSubtle,
        };
      case 'mood': {
        const moodContent = item.content as MoodLogContent;
        const config = getMoodConfig(moodContent.score);
        return {
          icon: 'heart-outline',
          label: 'Mood',
          color: config.color,
          accentBg: `${config.color}18`,
          score: moodContent.score,
          moodLabel: moodContent.label || config.label,
          emoji: config.emoji,
        };
      }
    }
  };

  const meta = getTypeMeta();

  return (
    <View style={styles.outerRow}>
      {/* Left Timeline Spine */}
      <View style={styles.spineContainer}>
        <View style={[styles.timelineDot, { backgroundColor: meta.color }]} />
        <View style={[styles.timelineLine, { backgroundColor: colors.borderSubtle }]} />
      </View>

      {/* Main Content Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Top Header: Time, Type Badge, and Actions */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.timeText, { color: colors.textPrimary }]}>
              {displayTime}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: meta.accentBg }]}>
              <Ionicons name={meta.icon as any} size={12} color={meta.color} />
              <Text style={[styles.typeBadgeText, { color: meta.color }]}>
                {meta.label}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
              accessibilityLabel="Edit log"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={13} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDelete(item)}
              style={[styles.actionBtn, { backgroundColor: colors.dangerSubtle }]}
              accessibilityLabel="Delete log"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={13} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        {item.type === 'text' && (
          <Text style={[styles.contentText, { color: colors.textPrimary }]}>
            {(item.content as TextLogContent).text}
          </Text>
        )}

        {item.type === 'voice' && (
          <View style={styles.voiceContainer}>
            <Text style={[styles.contentText, { color: colors.textPrimary }]}>
              {(item.content as VoiceLogContent).text}
            </Text>
            {(item.content as VoiceLogContent).durationSeconds !== undefined && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                <Text style={[styles.durationText, { color: colors.textMuted }]}>
                  {Math.round((item.content as VoiceLogContent).durationSeconds || 0)}s audio
                </Text>
              </View>
            )}
          </View>
        )}

        {item.type === 'mood' && (
          <View style={styles.moodContainer}>
            <View
              style={[
                styles.moodScoreBadge,
                { backgroundColor: meta.accentBg, borderColor: meta.color },
              ]}
            >
              <Text style={styles.moodEmoji}>{(meta as any).emoji}</Text>
              <Text style={[styles.moodScoreText, { color: meta.color }]}>
                {(meta as any).score}/10 — {(meta as any).moodLabel}
              </Text>
            </View>
            <Text style={[styles.contentText, { color: colors.textPrimary, marginTop: 8 }]}>
              {(item.content as MoodLogContent).reason}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

TimelineItem.displayName = 'TimelineItem';

const styles = StyleSheet.create({
  outerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  spineContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 18,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    bottom: -16,
    width: 2,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  voiceContainer: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moodContainer: {
    marginTop: 2,
  },
  moodScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodScoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
