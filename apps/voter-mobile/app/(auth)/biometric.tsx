/**
 * Biometric Verification Setup Gate
 * Redesigned with premium gold/charcoal fingerprint dashboard mockup.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useBiometric } from '@/hooks/useBiometric';

export default function BiometricScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ compulsory?: string }>();
  const isCompulsory = params.compulsory === 'true';
  const { setBiometricVerified, setBiometricSkipped, logout, voter } = useAuthStore();
  const {
    isAvailable,
    isEnrolled,
    biometricType,
    isChecking,
    error: biometricError,
    authenticate,
  } = useBiometric();

  const [isSuccess, setIsSuccess] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    // Pulse loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Glow loop
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.15,
          duration: 2000,
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

  const handleAuthenticate = async () => {
    setAuthenticating(true);
    const success = await authenticate();
    setAuthenticating(false);
    
    if (success) {
      setIsSuccess(true);
    }
  };

  const handleContinueToDashboard = () => {
    setBiometricVerified(true);
    router.replace('/(app)/dashboard');
  };

  const handleSkip = () => {
    setBiometricSkipped(true);
    router.replace('/(app)/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const canUseBiometric = isAvailable && isEnrolled;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.logoRow}>
          <Ionicons name="finger-print" size={24} color="#ffb597" />
          <Text style={styles.appBarTitle}>OndoDecide</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.profileButton}>
          <Ionicons name="person-circle" size={28} color="#e1bfb2" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Biometric Scanner Area */}
        <View style={styles.scannerWrapper}>
          {/* Ambient Glow */}
          <Animated.View
            style={[
              styles.ambientGlow,
              {
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.scannerFrame,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.scanRing} />
            <Ionicons name="finger-print" size={100} color="#f2641a" />
          </Animated.View>
        </View>

        {/* Informational Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {canUseBiometric ? 'Position thumb on sensor' : 'Biometric Setup Required'}
          </Text>
          {biometricError && <Text style={styles.errorText}>{biometricError}</Text>}
        </View>

        {/* Bento Cards */}
        <View style={styles.bentoSection}>
          <View style={styles.bentoCard}>
            <View style={styles.bentoIconBgPrimary}>
              <Ionicons name="lock-closed" size={20} color="#f2641a" />
            </View>
            <View style={styles.bentoTextWrap}>
              <Text style={styles.bentoTitle}>Hardware Encrypted</Text>
              <Text style={styles.bentoDesc}>
                Your biometric data is stored only on this device and never shared with central servers.
              </Text>
            </View>
          </View>

          <View style={styles.bentoCard}>
            <View style={styles.bentoIconBgSecondary}>
              <Ionicons name="shield-checkmark" size={20} color="#a1d494" />
            </View>
            <View style={styles.bentoTextWrap}>
              <Text style={styles.bentoTitle}>Universal Access</Text>
              <Text style={styles.bentoDesc}>
                Use your fingerprint to sign in, authorize votes, and manage your secure profile.
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {canUseBiometric ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuthenticate}
              disabled={authenticating}
              activeOpacity={0.8}
            >
              {authenticating ? (
                <ActivityIndicator color="#4e1900" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    Verify with {biometricType || 'Biometrics'}
                  </Text>
                  <Ionicons name="finger-print" size={18} color="#4e1900" />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={20} color="#ffb4ab" />
              <Text style={styles.warningText}>
                No hardware biometric verification setup found on this device. Please enable it in system settings.
              </Text>
            </View>
          )}

          {!isCompulsory && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>I will do it later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Success Modal Overlay */}
      <Modal visible={isSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={48} color="#a1d494" />
            </View>
            <Text style={styles.modalTitle}>Setup Complete</Text>
            <Text style={styles.modalSubtitle}>
              Your biometric identity is now securely linked to OndoDecide.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleContinueToDashboard}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Continue to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d100b', // Charcoal brown background
  },
  appBar: {
    height: 60,
    backgroundColor: 'rgba(29, 16, 11, 0.8)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffb597',
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    height: 4,
    width: 48,
    borderRadius: 2,
  },
  dotCompleted: {
    backgroundColor: '#90c283',
  },
  dotActive: {
    backgroundColor: '#f2641a',
  },
  dotInactive: {
    backgroundColor: '#41312b',
  },
  scannerWrapper: {
    position: 'relative',
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  ambientGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(242, 100, 26, 0.08)',
  },
  scannerFrame: {
    width: 180,
    height: 180,
    borderRadius: 36,
    backgroundColor: '#261813', // surface-container-low
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#f2641a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  scanRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(242, 100, 26, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7ddd4',
    textAlign: 'center',
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  bentoSection: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  bentoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  bentoIconBgPrimary: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(242, 100, 26, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoIconBgSecondary: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(35, 80, 30, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoTextWrap: {
    flex: 1,
  },
  bentoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7ddd4',
    marginBottom: 2,
  },
  bentoDesc: {
    fontSize: 12,
    color: '#e1bfb2',
    lineHeight: 16,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#f2641a', // primary-container
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#D95300',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#4e1900',
    fontSize: 16,
    fontWeight: '700',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(147, 0, 10, 0.25)',
    borderWidth: 1,
    borderColor: '#ffb4ab',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'center',
  },
  warningText: {
    color: '#ffb4ab',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  secondaryButton: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#e1bfb2',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 16, 11, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(42, 28, 23, 0.95)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#f2641a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(144, 194, 131, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7ddd4',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#e1bfb2',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 28,
  },
  modalButton: {
    backgroundColor: '#f2641a',
    height: 48,
    width: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#4e1900',
    fontSize: 15,
    fontWeight: '700',
  },
});
