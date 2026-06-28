/**
 * Login Screen
 * Voter enters their Voter ID (or email) + password.
 * Links to account activation for first-time users.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassInput, GradientButton, GlassCard } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) return;
    clearError();
    const success = await login({ identifier: identifier.trim(), password });
    if (success) {
      router.replace('/(auth)/biometric');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
              </View>
              <View style={styles.logoPulse} />
            </View>
            <Text style={styles.appName}>OndoDecide</Text>
            <Text style={styles.tagline}>Secure Digital Voting</Text>
          </View>

          {/* Login Card */}
          <GlassCard variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in with your Voter ID or email
            </Text>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <GlassInput
              label="Voter ID or Email"
              placeholder="e.g. VTR-2026-XXXX or email@example.com"
              icon="person-outline"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (error) clearError();
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <GlassInput
              label="Password"
              placeholder="Enter your password"
              icon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
            />

            <GradientButton
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!identifier.trim() || !password.trim()}
              icon={
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={Colors.textInverse}
                />
              }
            />
          </GlassCard>

          {/* Activate Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>First time here?</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/activate')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Activate your account</Text>
            </TouchableOpacity>
          </View>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Ionicons name="finger-print" size={14} color={Colors.biometric} />
            <Text style={styles.securityText}>
              Protected by biometric verification
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  logoPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: Colors.primaryGlow,
  },
  appName: {
    fontSize: FontSizes.hero,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    opacity: 0.7,
  },
  securityText: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },
});
