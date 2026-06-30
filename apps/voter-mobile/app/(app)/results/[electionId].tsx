import React, { useEffect, useState, useCallback } from 'react';
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

function CandidateResultRow({
  candidate,
  totalVotes,
  isWinner,
}: {
  candidate: Candidate;
  totalVotes: number;
  isWinner: boolean;
}) {
  const partyAbbr = candidate.party?.abbreviation || '';
  const partyColor = candidate.party?.primaryColor || (partyAbbr ? PARTY_COLORS[partyAbbr] : null) || Colors.textMuted;
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
              <Text style={[styles.partyText, { color: partyColor }]}>{partyAbbr}</Text>
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

interface CountdownProps {
  endDate: string;
  onComplete: () => void;
}

function CountdownTimer({ endDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        onComplete();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        ended: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (timeLeft.ended) {
    return <Text style={styles.countdownTitle}>Election Ended. Loading results...</Text>;
  }

  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return (
    <View style={styles.countdownContainer}>
      <Ionicons name="time-outline" size={48} color="#C98B45" style={styles.countdownIcon} />
      <Text style={styles.countdownTitle}>Results are Locked</Text>
      <Text style={styles.countdownSub}>Live results will be released as soon as the voting ends.</Text>

      <View style={styles.timerRow}>
        <View style={styles.timerSegment}>
          <Text style={styles.timerValue}>{formatNum(timeLeft.days)}</Text>
          <Text style={styles.timerLabel}>Days</Text>
        </View>
        <Text style={styles.timerColon}>:</Text>
        <View style={styles.timerSegment}>
          <Text style={styles.timerValue}>{formatNum(timeLeft.hours)}</Text>
          <Text style={styles.timerLabel}>Hours</Text>
        </View>
        <Text style={styles.timerColon}>:</Text>
        <View style={styles.timerSegment}>
          <Text style={styles.timerValue}>{formatNum(timeLeft.minutes)}</Text>
          <Text style={styles.timerLabel}>Mins</Text>
        </View>
        <Text style={styles.timerColon}>:</Text>
        <View style={styles.timerSegment}>
          <Text style={styles.timerValue}>{formatNum(timeLeft.seconds)}</Text>
          <Text style={styles.timerLabel}>Secs</Text>
        </View>
      </View>
    </View>
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
    elections,
    fetchElections,
  } = useElectionStore();

  useEffect(() => {
    if (electionId) fetchCandidates(electionId);
    if (elections.length === 0) fetchElections();
    return () => clearCandidates();
  }, [electionId]);

  const onRefresh = useCallback(() => {
    if (electionId) {
      fetchCandidates(electionId);
      fetchElections();
    }
  }, [electionId]);

  // Calculate stats
  const sortedCandidates = [...candidates].sort((a, b) => {
    const votesA = a._count?.votes ?? 0;
    const votesB = b._count?.votes ?? 0;
    return votesB - votesA;
  });

  const totalVotes = candidates.reduce((acc, c) => acc + (c._count?.votes ?? 0), 0);
  const highestVotes = sortedCandidates[0]?._count?.votes ?? 0;

  const election = elections.find((e) => e.id === electionId);
  const isClosed = election?.status === 'CLOSED';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackArrow size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Results Detail'}</Text>
          <Text style={styles.subtitle}>
            {isClosed ? `Total Cast: ${totalVotes.toLocaleString()} votes` : 'Results release pending'}
          </Text>
        </View>
      </View>

      {isLoadingCandidates ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating results...</Text>
        </View>
      ) : !isClosed ? (
        <CountdownTimer
          endDate={election?.endDate || new Date().toISOString()}
          onComplete={onRefresh}
        />
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

  // Countdown styles
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },
  countdownIcon: {
    marginBottom: 16,
  },
  countdownTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f7ddd4',
    marginBottom: 8,
    textAlign: 'center',
  },
  countdownSub: {
    fontSize: 14,
    color: '#e1bfb2',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
  },
  timerSegment: {
    alignItems: 'center',
    minWidth: 50,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f2641a',
  },
  timerLabel: {
    fontSize: 10,
    color: '#e1bfb2',
    textTransform: 'uppercase',
    marginTop: 4,
    fontWeight: '600',
  },
  timerColon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffb597',
    paddingBottom: 16,
  },
});
