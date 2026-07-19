/**
 * Candidate Detail + Vote Screen
 * Shows full candidate bio/info and the "Cast Vote" button.
 * One vote per election is enforced both client-side and server-side.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton, BackArrow } from '@/components';
import { useElectionStore } from '@/store/useElectionStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';
import type { CandidateDetail } from '@/services/electionService';
import { extractPlainText } from '@/utils/richText';

const PARTY_COLORS: Record<string, string> = {
  APC:  '#10B981',
  PDP:  '#3B82F6',
  LP:   '#F59E0B',
  NNPP: '#8B5CF6',
  APGA: '#EC4899',
  SDP:  '#06B6D4',
  YPP:  '#EF4444',
};

interface InfoRowProps { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function CandidateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    electionId: string;
    candidateId: string;
    electionTitle?: string;
  }>();
  const { electionId, candidateId, electionTitle } = params;

  const {
    candidateDetail,
    isLoadingDetail,
    isCastingVote,
    fetchCandidateDetail,
    clearCandidateDetail,
    castVote,
    hasVotedInElection,
  } = useElectionStore();

  const [voteSuccess, setVoteSuccess] = useState(false);
  const hasVoted = hasVotedInElection(electionId) || voteSuccess;

  useEffect(() => {
    if (electionId && candidateId) fetchCandidateDetail(electionId, candidateId);
    return () => clearCandidateDetail();
  }, [electionId, candidateId]);

  const partyAbbr = candidateDetail?.party?.abbreviation || '';

  const handleVote = () => {
    if (hasVoted) return;
    console.log("green wood");
    Alert.alert(
      'Confirm Your Vote',
      `Are you sure you want to vote for ${candidateDetail?.firstName} ${candidateDetail?.surname} (${partyAbbr})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Cast Vote',
          style: 'destructive',
          onPress: async () => {
            const success = await castVote(candidateId, electionId);
            if (success) {
              setVoteSuccess(true);
              Alert.alert(
                '✅ Vote Cast!',
                'Your vote has been recorded successfully.',
                [{ text: 'Back to Elections', onPress: () => router.replace('/(app)/vote') }]
              );
            }
          },
        },
      ]
    );
  };

  if (isLoadingDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading candidate...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!candidateDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.loadingText}>Candidate not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const partyColor = candidateDetail.party?.primaryColor || (partyAbbr ? PARTY_COLORS[partyAbbr] : null) || Colors.textMuted;
  const election = candidateDetail.election;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackArrow size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {electionTitle || 'Candidate'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileSection}>
          {candidateDetail.imageUrl ? (
            <Image source={{ uri: candidateDetail.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color={Colors.textMuted} />
            </View>
          )}
          <Text style={styles.fullName}>
            {candidateDetail.firstName}{candidateDetail.otherName ? ' ' + candidateDetail.otherName : ''} {candidateDetail.surname}
          </Text>
          <View style={[styles.partyBadge, { backgroundColor: partyColor + '22' }]}>
            <Text style={[styles.partyText, { color: partyColor }]}>{partyAbbr}</Text>
          </View>
        </View>

        {/* Bio */}
        <GlassCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.bio}>{extractPlainText(candidateDetail.bio)}</Text>
        </GlassCard>

        {/* Campaign Manifesto */}
        <GlassCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Campaign Manifesto</Text>
          <View style={styles.manifestoHeaderRow}>
            <Ionicons name="bulb-outline" size={18} color="#C98B45" />
            <Text style={styles.manifestoHeading}>Our Vision</Text>
          </View>
          <Text style={styles.manifestoText}>
            Building a progressive and inclusive society where technology, accountability, and citizen-led development drive sustainable growth.
          </Text>

          <View style={[styles.manifestoHeaderRow, { marginTop: 12 }]}>
            <Ionicons name="shield-outline" size={18} color="#C98B45" />
            <Text style={styles.manifestoHeading}>Core Pillars</Text>
          </View>
          <Text style={styles.manifestoText}>
            1. Transparency in governance and zero-tolerance for corruption.{"\n"}
            2. Revitalizing key public sectors including education, healthcare, and economic security.{"\n"}
            3. Promoting localized employment, small business incentives, and youth development programs.
          </Text>
        </GlassCard>

        {/* Personal Info */}
        <GlassCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <InfoRow icon="calendar-outline"  label="Date of Birth"  value={candidateDetail.DOB} />
          <InfoRow icon="person-outline"    label="Sex"            value={candidateDetail.sex} />
          <InfoRow icon="heart-outline"     label="Marital Status" value={candidateDetail.maritalStatus} />
          <InfoRow icon="school-outline"    label="Education"      value={candidateDetail.education} />
        </GlassCard>

        {/* Location */}
        <GlassCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <InfoRow icon="location-outline" label="State" value={candidateDetail.state} />
          <InfoRow icon="map-outline"      label="LGA"   value={candidateDetail.LGA} />
        </GlassCard>

        {/* Already voted banner */}
        {hasVoted ? (
          <View style={styles.votedBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.votedText}>You have already cast your vote in this election.</Text>
          </View>
        ) : (
          <GradientButton
            title="Cast My Vote"
            onPress={handleVote}
            isLoading={isCastingVote}
            icon={<Ionicons name="checkmark-done-circle" size={20} color={Colors.textInverse} />}
            style={styles.voteBtn}
          />
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>Your vote is anonymous and encrypted.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { flex: 1, fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  backLink: { marginTop: Spacing.sm },
  backLinkText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '700' },

  profileSection: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.primary, marginBottom: Spacing.md,
  },
  avatarPlaceholder: { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  fullName: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xs },
  partyBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  partyText: { fontSize: FontSizes.sm, fontWeight: '800', letterSpacing: 1 },

  voteCountCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  voteCountText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '600' },

  card: { marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  bio: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginBottom: 1 },
  infoValue: { fontSize: FontSizes.sm, color: Colors.textPrimary, fontWeight: '500' },

  electionName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  electionDates: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  votedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(16,185,129,0.1)',
    padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
    marginBottom: Spacing.md,
  },
  votedText: { color: Colors.success, fontSize: FontSizes.sm, flex: 1, fontWeight: '600' },

  voteBtn: { marginBottom: Spacing.md },
  disclaimer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, opacity: 0.6,
  },
  disclaimerText: { color: Colors.textMuted, fontSize: FontSizes.xs },
  manifestoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    marginTop: 4,
  },
  manifestoHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f7ddd4',
  },
  manifestoText: {
    fontSize: 13,
    color: '#e1bfb2',
    lineHeight: 18,
    paddingLeft: 24,
    marginBottom: 10,
  },
});
