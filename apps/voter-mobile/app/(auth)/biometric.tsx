/**
 * Biometric Verification Gate
 * After credential login, the voter MUST verify via fingerprint
 * before accessing the app. This adds a second factor of security.
 * 
 * Uses expo-local-authentication for Android fingerprint/biometric.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { useBiometric } from '@/hooks/useBiometric';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';

export default function BiometricScreen() {
  const router = useRouter();
  const { setBiometricVerified, logout, voter } = useAuthStore();
  const {
    isAvailable,
    isEnrolled,
    biometricType,
    isChecking,
    error: biometricError,
    authenticate,
  } = useBiometric();

  // Animated pulse for the fingerprint icon
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a pulsing animation loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, []);

  // Auto-trigger biometric prompt when screen loads
  useEffect(() => {
    if (!isChecking && isAvailable && isEnrolled) {
      const timeout = setTimeout(() => {
        handleAuthenticate();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [isChecking, isAvailable, isEnrolled]);

  const handleAuthenticate = async () => {
    const success = await authenticate();
    if (success) {
      setBiometricVerified(true);
      router.replace('/(app)/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const canUseBiometric = isAvailable && isEnrolled;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Fingerprint Visual */}
        <View style={styles.biometricSection}>
          <Animated.View
            style={[
              styles.outerRing,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.middleRing,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 0.8],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.fingerprintCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons
              name="finger-print"
              size={64}
              color={canUseBiometric ? Colors.biometric : Colors.textMuted}
            />
          </Animated.View>
        </View>

        {/* Info Text */}
        <View style={styles.textSection}>
          {voter && (
            <Text style={styles.greeting}>
              Hello, {voter.firstName || 'Voter'}
            </Text>
          )}
          <Text style={styles.title}>
            {canUseBiometric
              ? 'Verify Your Identity'
              : 'Biometric Not Available'}
          </Text>
          <Text style={styles.subtitle}>
            {canUseBiometric
              ? `Place your ${biometricType?.toLowerCase() || 'finger'} on the sensor to continue`
              : !isAvailable
                ? 'Your device does not support biometric authentication.'
                : 'No biometric data enrolled. Please set up fingerprint in your device settings.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {canUseBiometric ? (
            <GradientButton
              title={`Verify with ${biometricType || 'Biometrics'}`}
              onPress={handleAuthenticate}
              icon={
                <Ionicons
                  name="finger-print"
                  size={22}
                  color={Colors.textInverse}
                />
              }
              style={styles.verifyButton}
            />
          ) : (
            <View style={styles.unavailableCard}>
              <Ionicons
                name="warning-outline"
                size={24}
                color={Colors.warning}
              />
              <Text style={styles.unavailableText}>
                Biometric authentication is required to use this app.
                {!isEnrolled
                  ? ' Please enroll a fingerprint in your device settings.'
                  : ''}
              </Text>
            </View>
          )}

          {biometricError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{biometricError}</Text>
            </View>
          )}

          <GradientButton
            title="Sign out"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primaryDark} />
          <Text style={styles.securityText}>
            End-to-end encrypted session
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    width: 180,
    height: 180,
  },
  outerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: Colors.biometric,
  },
  middleRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: Colors.biometric,
  },
  fingerprintCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.biometricMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.biometric,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  verifyButton: {
    backgroundColor: Colors.biometric,
    shadowColor: Colors.biometric,
  },
  unavailableCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  unavailableText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    flex: 1,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    flex: 1,
  },
  logoutButton: {
    marginTop: Spacing.sm,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    opacity: 0.6,
  },
  securityText: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },
});
