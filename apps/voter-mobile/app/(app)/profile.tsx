/**
 * Profile Screen
 * Displays voter information and provides logout capability.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { voter, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {voter?.profilePicture ? (
            <Image source={{ uri: voter.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color={Colors.textMuted} />
            </View>
          )}
          <Text style={styles.fullName}>
            {voter?.firstName || ''} {voter?.otherName || ''} {voter?.surname || ''}
          </Text>
          <View style={styles.idBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
            <Text style={styles.idText}>{voter?.voterId || 'N/A'}</Text>
          </View>
        </View>

        {/* Personal Info Card */}
        <GlassCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <InfoRow icon="mail-outline" label="Email" value={voter?.email || ''} />
          <InfoRow icon="calendar-outline" label="Date of Birth" value={voter?.DOB || ''} />
          <InfoRow icon="person-outline" label="Sex" value={voter?.sex || ''} />
          <InfoRow icon="heart-outline" label="Marital Status" value={voter?.maritalStatus || ''} />
          <InfoRow icon="school-outline" label="Education" value={voter?.education || ''} />
        </GlassCard>

        {/* Location Card */}
        <GlassCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <InfoRow icon="location-outline" label="State" value={voter?.state || ''} />
          <InfoRow icon="map-outline" label="LGA" value={voter?.LGA || ''} />
          <InfoRow icon="home-outline" label="Address" value={voter?.residentialAddress || ''} />
        </GlassCard>

        {/* Logout */}
        <GradientButton
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
          style={styles.logoutBtn}
        />

        <Text style={styles.version}>Votosi v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.lg },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: Colors.primary, marginBottom: Spacing.md },
  avatarPlaceholder: { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  fullName: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs, textAlign: 'center' },
  idBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.primaryMuted, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  idText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700', letterSpacing: 1 },
  card: { marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  infoIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FontSizes.md, color: Colors.textPrimary, fontWeight: '500' },
  logoutBtn: { marginTop: Spacing.lg },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSizes.xs, marginTop: Spacing.lg },
});
