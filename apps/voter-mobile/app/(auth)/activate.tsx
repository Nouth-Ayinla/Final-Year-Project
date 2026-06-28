/**
 * Account Activation Screen
 * First-time voters enter their Voter ID, activation PIN, and set a password.
 * The Voter ID and PIN were emailed by the admin when the voter was registered.
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassInput, GradientButton, GlassCard } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';

export default function ActivateScreen() {
  const router = useRouter();
  const { activate, isLoading, error, clearError } = useAuthStore();

  const [voterId, setVoterId] = useState('');
  const [activationPin, setActivationPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleActivate = async () => {
    setLocalError('');
    clearError();

    if (!voterId.trim() || !activationPin.trim() || !password.trim()) {
      setLocalError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const success = await activate({
      voterId: voterId.trim(),
      activationPin: activationPin.trim(),
      password,
    });

    if (success) {
      router.replace('/(auth)/facial-verification');
    }
  };

  const displayError = localError || error;

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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Activate Account</Text>
            <Text style={styles.subtitle}>
              Enter the Voter ID and PIN sent to your email to get started
            </Text>
          </View>

          {/* Activation Card */}
          <GlassCard variant="elevated" style={styles.card}>
            {displayError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            <GlassInput
              label="Voter ID"
              placeholder="e.g. VTR-2026-XXXX"
              icon="card-outline"
              value={voterId}
              onChangeText={(text) => {
                setVoterId(text);
                setLocalError('');
                if (error) clearError();
              }}
              autoCapitalize="characters"
            />

            <GlassInput
              label="Activation PIN"
              placeholder="Enter 6-digit PIN from your email"
              icon="keypad-outline"
              value={activationPin}
              onChangeText={(text) => {
                setActivationPin(text);
                setLocalError('');
                if (error) clearError();
              }}
              keyboardType="number-pad"
              maxLength={6}
            />

            <GlassInput
              label="Create Password"
              placeholder="Min. 6 characters"
              icon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLocalError('');
              }}
            />

            <GlassInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              icon="lock-closed-outline"
              isPassword
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setLocalError('');
              }}
            />

            <GradientButton
              title="Activate Account"
              onPress={handleActivate}
              isLoading={isLoading}
              disabled={
                !voterId.trim() ||
                !activationPin.trim() ||
                !password.trim() ||
                !confirmPassword.trim()
              }
              icon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={Colors.textInverse}
                />
              }
            />
          </GlassCard>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already activated?</Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
            <Text style={styles.infoText}>
              Check your email for the Voter ID and activation PIN. They were sent when
              an officer registered you.
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
  },
  backButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
  card: {
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
    marginBottom: Spacing.md,
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
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    flex: 1,
    lineHeight: 18,
  },
});
