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
import { useAuthStore } from '@/store/useAuthStore';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '@/services/apiClient';
import { useBiometric } from '@/hooks/useBiometric';

const VOTER_STORE_KEY = 'ondodecide_voter';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError, setBiometricVerified, getBiometricCredentials } = useAuthStore();
  const { authenticate } = useBiometric();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isIdFocused, setIsIdFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) return;
    clearError();
    const success = await login({ identifier: identifier.trim(), password });
    if (success) {
      router.replace('/(auth)/biometric?compulsory=true');
    }
  };

  const handleFingerprintLogin = async () => {
    try {
      // Check if biometric credentials are stored
      const credentials = await getBiometricCredentials();
      
      console.log('Fingerprint login check:');
      console.log('Credentials exist:', !!credentials);
      
      if (!credentials) {
        Alert.alert(
          'Credentials Required',
          'Please sign in with your ID and password first. Your credentials will be saved for future biometric logins.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Verify device fingerprint
      const biometricSuccess = await authenticate();
      if (!biometricSuccess) {
        return;
      }

      // Use stored credentials to login
      const loginSuccess = await login(credentials);
      if (loginSuccess) {
        setBiometricVerified(true);
        router.replace('/(app)/dashboard');
      }
    } catch (err) {
      console.error('Fingerprint login error:', err);
    }
  };

  const handleFaceLogin = () => {
    // Navigate to facial verification screen for face capture and login
    router.push('/(auth)/facial-verification');
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
          <View style={styles.formContainer}>
            {/* Logo Image */}
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ffb4ab" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Identifier Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Voter ID or Email Address</Text>
              <View style={[styles.inputWrapper, isIdFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your ID or Email"
                  placeholderTextColor="rgba(247, 221, 212, 0.3)"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (error) clearError();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setIsIdFocused(true)}
                  onBlur={() => setIsIdFocused(false)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Secure Password</Text>
              <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(247, 221, 212, 0.3)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) clearError();
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#e1bfb2"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Sign In Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!identifier.trim() || !password.trim() || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!identifier.trim() || !password.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#4e1900" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#4e1900" />
                </>
              )}
            </TouchableOpacity>

            {/* Biometric Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Biometric Icon Buttons */}
            <View style={styles.biometricsContainer}>
              <TouchableOpacity
                style={[styles.biometricButton, styles.biometricButtonActive]}
                onPress={handleFaceLogin}
                activeOpacity={0.7}
              >
                <Ionicons name="scan" size={26} color="#ffb597" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.biometricButton, styles.biometricButtonActive]}
                onPress={handleFingerprintLogin}
                activeOpacity={0.7}
              >
                <Ionicons name="finger-print" size={26} color="#ffb597" />
              </TouchableOpacity>
            </View>

            {/* Footer Activation Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/activate')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Activate</Text>
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
    backgroundColor: '#121212', // Charcoal background
  },
  flex: {
    flex: 1,
  },
  appBar: {
    height: 60,
    backgroundColor: 'rgba(29, 16, 11, 0.8)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#ffb597', // primary color
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 440,
    padding: 16,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f7ddd4', // on-surface
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#e1bfb2', // on-surface-variant
    marginBottom: 24,
    textAlign: 'center',
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
    marginBottom: 16,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e1bfb2',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 11, 7, 0.5)', // surface-container-lowest
    borderWidth: 1,
    borderColor: '#594138', // outline-variant
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: '#ffb597',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: '#f7ddd4',
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    color: '#ffb597',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#f2641a', // primary-container
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    shadowColor: '#D95300',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(242, 100, 26, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#4e1900', // on-primary-container
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(89, 65, 56, 0.3)',
  },
  dividerText: {
    color: '#e1bfb2',
    fontSize: 12,
  },
  biometricsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  biometricButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(89, 65, 56, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonActive: {
    borderColor: 'rgba(255, 181, 151, 0.3)',
    backgroundColor: 'rgba(255, 181, 151, 0.05)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    color: '#e1bfb2',
    fontSize: 14,
  },
  footerLink: {
    color: '#ffb597',
    fontWeight: '700',
  },
});

