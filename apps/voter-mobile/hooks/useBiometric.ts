/**
 * Biometric authentication hook.
 * Wraps expo-local-authentication for fingerprint verification.
 * Checks hardware capability and enrolled biometrics.
 */
import { useState, useCallback, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricState {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: string | null;
  isChecking: boolean;
  error: string | null;
}

export function useBiometric() {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    isEnrolled: false,
    biometricType: null,
    isChecking: true,
    error: null,
  });

  // Check hardware support on mount
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: string | null = null;
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'Fingerprint';
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        biometricType = 'Face Recognition';
      } else if (
        supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)
      ) {
        biometricType = 'Iris';
      }

      setState({
        isAvailable: hasHardware,
        isEnrolled,
        biometricType,
        isChecking: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isChecking: false,
        error: 'Could not check biometric support.',
      }));
    }
  };

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use device passcode',
      });

      if (result.success) {
        return true;
      }

      if (result.error === 'user_cancel') {
        setState((prev) => ({ ...prev, error: null }));
      } else {
        setState((prev) => ({
          ...prev,
          error: result.warning || 'Authentication failed. Please try again.',
        }));
      }
      return false;
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'An unexpected error occurred during authentication.',
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    authenticate,
    checkBiometricSupport,
  };
}
