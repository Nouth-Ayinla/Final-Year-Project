/**
 * Dashboard / Home Screen
 * Shows voter greeting, quick stats, and feature cards.
 * This is the main landing screen after biometric verification.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { useElectionStore } from '@/store/useElectionStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'vote',
    icon: 'checkmark-done-circle',
    title: 'Cast Vote',
    subtitle: 'View active elections',
    color: Colors.primary,
    bgColor: Colors.primaryMuted,
  },
  {
    id: 'results',
    icon: 'bar-chart-outline',
    title: 'Results',
    subtitle: 'Election outcomes',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  {
    id: 'support',
    icon: 'chatbubble-ellipses-outline',
    title: 'Support',
    subtitle: 'Get help',
    color: Colors.warning,
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const voter = useAuthStore((s) => s.voter);
  const { elections, fetchElections, votedElections } = useElectionStore();

  useEffect(() => { fetchElections(); }, []);

  const activeElection = elections.find((e) => e.status === 'ACTIVE');
  const upcomingElection = elections.find((e) => e.status === 'UPCOMING');
  const bannerElection = activeElection ?? upcomingElection ?? null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>
              {voter?.firstName || 'Voter'} {voter?.surname || ''}
            </Text>
          </View>
          {voter?.profilePicture ? (
            <Image
              source={{ uri: voter.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color={Colors.textMuted} />
            </View>
          )}
        </View>

        {/* Voter ID Card */}
        <GlassCard variant="elevated" style={styles.voterIdCard}>
          <View style={styles.voterIdHeader}>
            <View style={styles.voterIdBadge}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
              <Text style={styles.voterIdLabel}>VOTER ID</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.voterId}>{voter?.voterId || 'N/A'}</Text>
          <View style={styles.voterIdDivider} />
          <View style={styles.voterIdDetails}>
            <View style={styles.voterIdDetail}>
              <Text style={styles.detailLabel}>State</Text>
              <Text style={styles.detailValue}>{voter?.state || '—'}</Text>
            </View>
            <View style={styles.voterIdDetail}>
              <Text style={styles.detailLabel}>LGA</Text>
              <Text style={styles.detailValue}>{voter?.LGA || '—'}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Active Election Banner */}
        <TouchableOpacity
          style={[styles.electionBanner, bannerElection && styles.electionBannerActive]}
          activeOpacity={0.85}
          onPress={() => bannerElection && router.push('/(app)/vote')}
        >
          <View style={styles.electionPulse} />
          <Ionicons
            name={bannerElection?.status === 'ACTIVE' ? 'megaphone' : 'time-outline'}
            size={24}
            color={bannerElection?.status === 'ACTIVE' ? Colors.primary : Colors.warning}
          />
          <View style={styles.electionInfo}>
            <Text style={styles.electionTitle} numberOfLines={1}>
              {bannerElection ? bannerElection.title : 'No Active Elections'}
            </Text>
            <Text style={styles.electionSubtitle}>
              {bannerElection?.status === 'ACTIVE'
                ? 'Tap to vote now'
                : bannerElection?.status === 'UPCOMING'
                ? 'Coming soon — tap to see details'
                : "You'll be notified when voting begins"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => {
                if (action.id === 'vote') {
                  router.push('/(app)/vote');
                } else if (action.id === 'results') {
                  router.push('/(app)/results');
                } else if (action.id === 'support') {
                  router.push('/(app)/support');
                } else if (action.id === 'history') {
                  const votedList = elections.filter((e) => votedElections[e.id]);
                  if (votedList.length === 0) {
                    Alert.alert(
                      'Vote History',
                      'You have not cast any votes in the current session yet.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    const listString = votedList
                      .map((e) => `• ${e.title}`)
                      .join('\n');
                    Alert.alert(
                      'Vote History',
                      `You have successfully voted in:\n\n${listString}`,
                      [{ text: 'OK' }]
                    );
                  }
                }
              }}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: action.bgColor }]}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Status */}
        <GlassCard style={styles.securityCard}>
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>Security Status</Text>
              <Text style={styles.securitySubtitle}>
                Biometric verified • Session active
              </Text>
            </View>
            <View style={styles.statusDot} />
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voterIdCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundTertiary,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  voterIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  voterIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  voterIdLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: '600',
  },
  voterId: {
    fontSize: FontSizes.xxl,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  voterIdDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  voterIdDetails: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  voterIdDetail: {},
  detailLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  electionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  electionBannerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  electionPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.lg,
  },
  electionInfo: {
    flex: 1,
  },
  electionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  electionSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  securityCard: {
    marginBottom: Spacing.md,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  securitySubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
});
