/**
 * Account Activation Screen
 * Splits the onboarding flow into three sequential steps:
 * 1. Voter ID Verification
 * 2. Activation PIN Verification
 * 3. Secure Password Setup
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
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BackArrow } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';

export default function ActivateScreen() {
  const router = useRouter();
  const { activate, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState(1);
  const [voterId, setVoterId] = useState('');
  const [activationPin, setActivationPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // Input Focus States
  const [isVoterIdFocused, setIsVoterIdFocused] = useState(false);
  const [isPinFocused, setIsPinFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNext = () => {
    setLocalError('');
    clearError();

    if (step === 1) {
      const rawId = voterId.trim();
      if (!rawId) {
        setLocalError('Voter ID is required.');
        return;
      }

      // Automatically format VTVTO12345 into VT-VTO-12345
      let normalized = rawId;
      const clean = rawId.replace(/-/g, '');
      if (clean.length === 10 && !rawId.includes('-')) {
        normalized = `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
      }

      const pattern = /^VT-VTO-\d{5}$/;
      if (!pattern.test(normalized)) {
        setLocalError('Voter ID must be in the format VT-VTO-XXXXX.');
        return;
      }

      setVoterId(normalized);
      setStep(2);
    } else if (step === 2) {
      if (!activationPin.trim()) {
        setLocalError('Activation PIN is required.');
        return;
      }
      if (activationPin.length !== 6) {
        setLocalError('Activation PIN must be exactly 6 digits.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setLocalError('');
    clearError();
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleActivate = async () => {
    setLocalError('');
    clearError();

    if (!password.trim() || !confirmPassword.trim()) {
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

  const handleVoterIdChange = (text: string) => {
    const sanitized = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setVoterId(sanitized);
    setLocalError('');
    if (error) clearError();
  };

  const handlePinChange = (text: string) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    setActivationPin(sanitized);
    setLocalError('');
    if (error) clearError();
  };

  const displayError = localError || error;

  // Step Progress Config
  const getStepProgressWidth = () => {
    if (step === 1) return '33.33%';
    if (step === 2) return '66.66%';
    return '100%';
  };

  const getStepTitle = () => {
    if (step === 1) return 'Identity Verification';
    if (step === 2) return 'PIN Verification';
    return 'Setup Password';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.backIconButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrow size={24} color="#f7ddd4" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderBox} />
          )}
          <Text style={styles.headerBarTitle}>Activation</Text>
          <View style={styles.placeholderBox} />
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressTitle}>Step {step}: {getStepTitle()}</Text>
            <Text style={styles.progressFraction}>{step}/3</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarActive, { width: getStepProgressWidth() }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Form Box */}
          <View style={styles.mainBox}>
            {/* Logo Image */}
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {displayError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ffb4ab" />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            {/* STEP 1: VOTER ID */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepHeader}>Enter Voter ID</Text>
                <Text style={styles.stepSub}>Enter the Voter ID (e.g. VT-VTO-12345) provided in your registration email.</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Voter ID</Text>
                  <View style={[styles.inputWrapper, isVoterIdFocused && styles.inputWrapperFocused]}>
                    <TextInput
                      style={[styles.input, styles.trackingWide]}
                      placeholder="ENTER VOTER ID"
                      placeholderTextColor="rgba(247, 221, 212, 0.3)"
                      value={voterId}
                      onChangeText={handleVoterIdChange}
                      maxLength={12}
                      autoCapitalize="characters"
                      onFocus={() => setIsVoterIdFocused(true)}
                      onBlur={() => setIsVoterIdFocused(false)}
                    />
                    <Ionicons name="card-outline" size={20} color="#e1bfb2" />
                  </View>
                  <Text style={styles.inputHint}>Check your registration email for your ID</Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, !voterId.trim() && styles.actionButtonDisabled]}
                  onPress={handleNext}
                  disabled={!voterId.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>Next</Text>
                  <Ionicons name="arrow-forward" size={18} color="#591d00" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: PIN */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepHeader}>Enter Activation PIN</Text>
                <Text style={styles.stepSub}>Enter the 6-digit numeric PIN sent to your registered email.</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Activation PIN</Text>
                  <View style={[styles.inputWrapper, isPinFocused && styles.inputWrapperFocused]}>
                    <TextInput
                      style={[styles.input, styles.trackingWide]}
                      placeholder="6-DIGIT PIN"
                      placeholderTextColor="rgba(247, 221, 212, 0.3)"
                      value={activationPin}
                      onChangeText={handlePinChange}
                      maxLength={6}
                      keyboardType="number-pad"
                      onFocus={() => setIsPinFocused(true)}
                      onBlur={() => setIsPinFocused(false)}
                    />
                    <Ionicons name="key-outline" size={20} color="#e1bfb2" />
                  </View>
                  <Text style={styles.inputHint}>Check your spam folder if not found in inbox</Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, !activationPin.trim() && styles.actionButtonDisabled]}
                  onPress={handleNext}
                  disabled={!activationPin.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>Next</Text>
                  <Ionicons name="arrow-forward" size={18} color="#591d00" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: SETUP PASSWORD */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepHeader}>Create Password</Text>
                <Text style={styles.stepSub}>Set a strong password to lock and protect your ballot credentials.</Text>

                {/* Password field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Enter Password</Text>
                  <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(247, 221, 212, 0.3)"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setLocalError('');
                      }}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#e1bfb2"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[styles.inputWrapper, isConfirmPasswordFocused && styles.inputWrapperFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(247, 221, 212, 0.3)"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setLocalError('');
                      }}
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setIsConfirmPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#e1bfb2"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    (!password.trim() || !confirmPassword.trim() || isLoading) && styles.actionButtonDisabled,
                    styles.glowingButton,
                  ]}
                  onPress={handleActivate}
                  disabled={!password.trim() || !confirmPassword.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#591d00" size="small" />
                  ) : (
                    <>
                      <Text style={styles.actionButtonText}>Activate Account</Text>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#591d00" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom link to sign in */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already activated?</Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d100b', // Deep warm brown
  },
  flex: {
    flex: 1,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBarTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#f7ddd4',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholderBox: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    color: '#f7ddd4',
    fontSize: 16,
    fontWeight: '500',
  },
  progressFraction: {
    color: '#e1bfb2',
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#41312b', // surface-container-highest
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: '#f2641a', // primary-container (vibrant orange)
    borderRadius: 4,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainBox: {
    width: '100%',
    marginTop: 12,
  },
  stepContent: {
    width: '100%',
  },
  stepHeader: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7ddd4',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSub: {
    fontSize: 14,
    color: '#e1bfb2',
    lineHeight: 20,
    marginBottom: 28,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 0, 10, 0.25)', // error-container
    borderWidth: 1,
    borderColor: '#ffb4ab',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 14,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#f7ddd4',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1c17', // surface-container
    borderWidth: 1,
    borderColor: '#594138', // outline-variant
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: '#ffb597',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: '#f7ddd4',
    fontSize: 16,
    height: '100%',
  },
  trackingWide: {
    letterSpacing: 2,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    color: '#e1bfb2',
    marginLeft: 4,
    marginTop: 4,
  },
  eyeButton: {
    padding: 8,
  },
  actionButton: {
    backgroundColor: '#ffb597', // primary
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(255, 181, 151, 0.4)',
  },
  actionButtonText: {
    color: '#591d00', // on-primary
    fontSize: 16,
    fontWeight: '700',
  },
  glowingButton: {
    backgroundColor: '#ffb597',
    shadowColor: '#ffb597',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    color: '#e1bfb2',
    fontSize: 14,
  },
  footerLink: {
    color: '#ffb597',
    fontWeight: '700',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
});
