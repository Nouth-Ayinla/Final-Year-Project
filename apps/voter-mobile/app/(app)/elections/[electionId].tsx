/**
 * Candidates List Screen
 * Shows all candidates for a given election.
 * Only ACTIVE elections are tappable (to prevent voting in closed/upcoming elections).
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
import { GlassCard, BackArrow } from '@/components';
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

function CandidateCard({
  candidate,
  onPress,
}: {
  candidate: Candidate;
  onPress: () => void;
}) {
  const partyAbbr = candidate.party?.abbreviation || '';
  const partyColor = candidate.party?.primaryColor || (partyAbbr ? PARTY_COLORS[partyAbbr] : Colors.textMuted) || Colors.textMuted;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard variant="elevated" style={styles.card}>
        <View style={styles.cardRow}>
          {candidate.imageUrl ? (
            <Image source={{ uri: candidate.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={28} color={Colors.textMuted} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {candidate.firstName} {candidate.otherName ? candidate.otherName + ' ' : ''}{candidate.surname}
            </Text>
            <View style={[styles.partyBadge, { backgroundColor: partyColor + '22' }]}>
              <Text style={[styles.partyText, { color: partyColor }]}>{partyAbbr}</Text>
            </View>
            <Text style={styles.meta}>{candidate.state} · {candidate.LGA}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function ElectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ electionId: string; title?: string }>();
  const { electionId, title } = params;

  const {
    candidates,
    isLoadingCandidates,
    fetchCandidates,
    clearCandidates,
    hasVotedInElection,
  } = useElectionStore();

  useEffect(() => {
    if (electionId) fetchCandidates(electionId);
    return () => clearCandidates();
  }, [electionId]);

  const onRefresh = useCallback(() => {
    if (electionId) fetchCandidates(electionId);
  }, [electionId]);

  const hasVoted = hasVotedInElection(electionId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackArrow size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Election'}</Text>
          <Text style={styles.subtitle}>Select a candidate to view details and vote</Text>
        </View>
      </View>

      {/* Already voted banner */}
      {hasVoted && (
        <View style={styles.votedBanner}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={styles.votedText}>You have already cast your vote in this election.</Text>
        </View>
      )}

      {isLoadingCandidates ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading candidates...</Text>
        </View>
      ) : candidates.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Candidates Yet</Text>
          <Text style={styles.emptyText}>Candidates have not been added to this election yet.</Text>
        </View>
      ) : (
        <FlatList
          data={candidates}
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
          renderItem={({ item }) => (
            <CandidateCard
              candidate={item}
              onPress={() =>
                router.push({
                  pathname: '/(app)/elections/[electionId]/[candidateId]',
                  params: {
                    electionId,
                    candidateId: item.id,
                    electionTitle: title,
                  },
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
  votedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(16,185,129,0.1)',
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  votedText: { color: Colors.success, fontSize: FontSizes.sm, flex: 1 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
  card: { marginBottom: Spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: Colors.border,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  partyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
    borderRadius: BorderRadius.full, marginBottom: 4,
  },
  partyText: { fontSize: FontSizes.xs, fontWeight: '700' },
  meta: { fontSize: FontSizes.xs, color: Colors.textMuted },
});
