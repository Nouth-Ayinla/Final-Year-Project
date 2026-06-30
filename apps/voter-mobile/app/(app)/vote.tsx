/**
 * Vote Screen — Elections List
 * Shows all ACTIVE and UPCOMING elections the voter can participate in.
 * Navigates to the candidates list on tap.
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components';
import { useElectionStore } from '@/store/useElectionStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';
import { Election, ElectionStatus } from '@/services/electionService';
import { extractPlainText } from '@/utils/richText';

const STATUS_CONFIG: Record<ElectionStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  ACTIVE:   { label: 'Live',     color: Colors.success, bg: 'rgba(16,185,129,0.12)', icon: 'radio-button-on' },
  UPCOMING: { label: 'Upcoming', color: Colors.warning, bg: 'rgba(245,158,11,0.12)', icon: 'time-outline' },
  DRAFT:    { label: 'Draft',    color: Colors.textMuted, bg: 'rgba(100,116,139,0.12)', icon: 'document-outline' },
  CLOSED:   { label: 'Ended',   color: Colors.error,   bg: 'rgba(239,68,68,0.12)',    icon: 'lock-closed-outline' },
};

function ElectionCard({ election, onPress }: { election: Election; onPress: () => void }) {
  const cfg = STATUS_CONFIG[election.status];
  const start = new Date(election.startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const end   = new Date(election.endDate).toLocaleDateString('en-NG',   { day: 'numeric', month: 'short', year: 'numeric' });
  const isVotable = election.status === 'ACTIVE';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={isVotable ? 0.75 : 0.9} disabled={!isVotable}>
      <GlassCard
        variant="elevated"
        style={[styles.card, isVotable && styles.cardActive]}
      >
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>

        <Text style={styles.electionTitle} numberOfLines={2}>{election.title}</Text>
        {election.description ? (
          <Text style={styles.electionDesc} numberOfLines={2}>
            {extractPlainText(election.description)}
          </Text>
        ) : null}

        <View style={styles.dateBadges}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.dateText}>Starts {start}</Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="calendar" size={14} color={Colors.textMuted} />
            <Text style={styles.dateText}>Ends {end}</Text>
          </View>
          {typeof election._count?.votes === 'number' && (
            <View style={styles.dateItem}>
              <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.dateText}>{election._count.votes} votes</Text>
            </View>
          )}
        </View>

        {isVotable && (
          <View style={styles.voteRow}>
            <Text style={styles.voteCTA}>Tap to vote</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function VoteScreen() {
  const router = useRouter();
  const { elections, isLoadingElections, fetchElections } = useElectionStore();

  useEffect(() => { fetchElections(); }, []);

  const onRefresh = useCallback(() => { fetchElections(); }, []);

  const active   = elections.filter((e) => e.status === 'ACTIVE');
  const upcoming = elections.filter((e) => e.status === 'UPCOMING');
  const closed   = elections.filter((e) => e.status === 'CLOSED');
  const ordered  = [...active, ...upcoming, ...closed];

  if (isLoadingElections) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Elections</Text>
          <Text style={styles.subtitle}>Cast your vote</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading elections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Elections</Text>
        <Text style={styles.subtitle}>Cast your vote</Text>
      </View>

      {ordered.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Elections Available</Text>
          <Text style={styles.emptyText}>
            There are no elections right now.{'\n'}Pull down to refresh.
          </Text>
        </View>
      ) : (
        <FlatList
          data={ordered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingElections}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ElectionCard
              election={item}
              onPress={() =>
                router.push({
                  pathname: '/(app)/elections/[electionId]',
                  params: { electionId: item.id, title: item.title },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Card
  card: { marginBottom: Spacing.md },
  cardActive: { borderColor: Colors.primary, borderWidth: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.full, marginBottom: Spacing.sm,
  },
  statusText: { fontSize: FontSizes.xs, fontWeight: '700' },
  electionTitle: {
    fontSize: FontSizes.lg, fontWeight: '800',
    color: Colors.textPrimary, marginBottom: Spacing.xs,
  },
  electionDesc: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    lineHeight: 20, marginBottom: Spacing.sm,
  },
  dateBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.md,
    rowGap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: FontSizes.xs, color: Colors.textMuted },
  voteRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 4, marginTop: Spacing.xs,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm,
  },
  voteCTA: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700' },
});
