/**
 * Detailed Election Results Screen
 * Shows the vote breakdown and candidate rankings for a given election.
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components';
import { useElectionStore } from '@/store/useElectionStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';
import { Candidate } from '@/services/electionService';

const PARTY_COLORS: Record<string, string> = {
  APC:  '#10B981',
  PDP:  '#3B82F6',
  LP:   '#F59E0B',
  NNPP: '#8B5CF6',
  APGA: '#EC4899',
  SDP:  '#06B6D4',
  YPP:  '#EF4444',
};

function CandidateResultRow({
  candidate,
  totalVotes,
  isWinner,
}: {
  candidate: Candidate;
  totalVotes: number;
  isWinner: boolean;
}) {
  const partyColor = PARTY_COLORS[candidate.party] ?? Colors.textMuted;
  const votes = candidate._count?.votes ?? 0;
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

  return (
    <GlassCard variant="elevated" style={[styles.card, isWinner && styles.winnerCard]}>
      <View style={styles.cardRow}>
        {candidate.imageUrl ? (
          <Image source={{ uri: candidate.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color={Colors.textMuted} />
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {candidate.firstName} {candidate.surname}
            </Text>
            {isWinner && totalVotes > 0 && (
              <View style={styles.winnerBadge}>
                <Ionicons name="trophy" size={12} color="#FFF" />
                <Text style={styles.winnerText}>Leading</Text>
              </View>
            )}
          </View>

          <View style={styles.partyAndStats}>
            <View style={[styles.partyBadge, { backgroundColor: partyColor + '22' }]}>
              <Text style={[styles.partyText, { color: partyColor }]}>{candidate.party}</Text>
            </View>
            <Text style={styles.voteText}>
              {votes.toLocaleString()} vote{votes !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentage}%`, backgroundColor: partyColor },
              ]}
            />
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

export default function ElectionResultsDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ electionId: string; title?: string }>();
  const { electionId, title } = params;

  const {
    candidates,
    isLoadingCandidates,
    fetchCandidates,
    clearCandidates,
  } = useElectionStore();

  useEffect(() => {
    if (electionId) fetchCandidates(electionId);
    return () => clearCandidates();
  }, [electionId]);

  const onRefresh = useCallback(() => {
    if (electionId) fetchCandidates(electionId);
  }, [electionId]);

  // Calculate stats
  const sortedCandidates = [...candidates].sort((a, b) => {
    const votesA = a._count?.votes ?? 0;
    const votesB = b._count?.votes ?? 0;
    return votesB - votesA;
  });

  const totalVotes = candidates.reduce((acc, c) => acc + (c._count?.votes ?? 0), 0);
  const highestVotes = sortedCandidates[0]?._count?.votes ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Results Detail'}</Text>
          <Text style={styles.subtitle}>
            Total Cast: {totalVotes.toLocaleString()} votes
          </Text>
        </View>
      </View>

      {isLoadingCandidates ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating results...</Text>
        </View>
      ) : candidates.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="stats-chart-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyText}>There are no candidates or votes registered for this election.</Text>
        </View>
      ) : (
        <FlatList
          data={sortedCandidates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingCandidates}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item, index }) => (
            <CandidateResultRow
              candidate={item}
              totalVotes={totalVotes}
              isWinner={index === 0 && (item._count?.votes ?? 0) > 0 && (item._count?.votes ?? 0) === highestVotes}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { flex: 1 },
  title: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },

  card: { marginBottom: Spacing.md },
  winnerCard: { borderColor: Colors.primary + '66', borderWidth: 1.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 2, borderColor: Colors.border,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  name: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, flexShrink: 1 },
  winnerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  winnerText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  partyAndStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  partyBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  partyText: { fontSize: 10, fontWeight: '700' },
  voteText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
