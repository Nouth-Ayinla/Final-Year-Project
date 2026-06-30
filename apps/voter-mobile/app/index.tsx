/**
 * Index route — redirects based on auth state.
 * 
 * Auth flow:
 * 1. Not authenticated → Login screen
 * 2. Authenticated but biometric not verified → Biometric screen
 * 3. Fully authenticated → Dashboard
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBiometricVerified = useAuthStore((s) => s.isBiometricVerified);
  const biometricSkipped = useAuthStore((s) => s.biometricSkipped);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (!isBiometricVerified && !biometricSkipped) {
        router.replace('/(auth)/biometric');
      } else {
        router.replace('/(app)/dashboard');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isBiometricVerified, biometricSkipped]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
