/**
 * Results Screen — Election Results List
 * Shows all non-DRAFT elections with their total vote counts.
 * Tapping an election opens the detailed breakdown by candidate.
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
import { GlassCard, BackArrow } from '@/components';
import { useElectionStore } from '@/store/useElectionStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';
import { Election, ElectionStatus } from '@/services/electionService';

const STATUS_LABEL: Record<ElectionStatus, { label: string; color: string }> = {
  ACTIVE:   { label: 'Live',     color: Colors.success },
  UPCOMING: { label: 'Upcoming', color: Colors.warning },
  CLOSED:   { label: 'Ended',    color: Colors.error   },
  DRAFT:    { label: 'Draft',    color: Colors.textMuted },
};

function ElectionResultCard({
  election,
  onPress,
}: {
  election: Election;
  onPress: () => void;
}) {
  const cfg = STATUS_LABEL[election.status];
  const totalVotes = election._count?.votes ?? 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard variant="elevated" style={styles.card}>
        {/* Status + total votes row */}
        <View style={styles.cardTop}>
          <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          <View style={styles.spacer} />
          <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.voteCount}>{totalVotes.toLocaleString()} votes</Text>
        </View>

        <Text style={styles.electionTitle} numberOfLines={2}>{election.title}</Text>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.dateText}>
            {new Date(election.startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' — '}
            {new Date(election.endDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>

        <View style={styles.viewRow}>
          <Text style={styles.viewCTA}>View results</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function ResultsScreen() {
  const router = useRouter();
  const { elections, isLoadingElections, fetchElections } = useElectionStore();

  useEffect(() => { fetchElections(); }, []);
  const onRefresh = useCallback(() => { fetchElections(); }, []);

  const visible = elections.filter((e) => e.status !== 'DRAFT');
  const closed  = visible.filter((e) => e.status === 'CLOSED');
  const others  = visible.filter((e) => e.status !== 'CLOSED');
  const ordered = [...closed, ...others];

  if (isLoadingElections) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <BackArrow size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Results</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackArrow size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle}>Election outcomes</Text>
        </View>
      </View>

      {ordered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Results Yet</Text>
          <Text style={styles.emptyText}>Results will appear once elections begin.</Text>
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
            <ElectionResultCard
              election={item}
              onPress={() =>
                router.push({
                  pathname: '/(app)/results/[electionId]',
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm, paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  title:    { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  list:     { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptyText:  { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },

  card: { marginBottom: Spacing.md },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: Spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FontSizes.xs, fontWeight: '700' },
  spacer: { flex: 1 },
  voteCount: { fontSize: FontSizes.xs, color: Colors.textMuted, marginLeft: 4 },
  electionTitle: {
    fontSize: FontSizes.lg, fontWeight: '800',
    color: Colors.textPrimary, marginBottom: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, marginBottom: Spacing.sm,
  },
  dateText: { fontSize: FontSizes.xs, color: Colors.textMuted },
  viewRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', gap: 4,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm,
  },
  viewCTA: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700' },
});
