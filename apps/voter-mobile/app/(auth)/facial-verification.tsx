/**
 * Facial Verification / Identity Enrollment Screen
 * Renders a high-fidelity biometric scanning interface.
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { electionService } from '@/services/electionService';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/useAuthStore';


type Stage = 'permission' | 'camera' | 'verifying' | 'success';

export default function FacialVerificationScreen() {
  const router = useRouter();
  const voter = useAuthStore((state) => state.voter);
  const { login, getBiometricCredentials, setBiometricVerified } = useAuthStore();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('permission');

  // Scanning laser animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  // Glowing border pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sync stage with camera permissions
  useEffect(() => {
    if (permission?.granted) {
      setStage('camera');
    } else {
      setStage('permission');
    }
  }, [permission]);

  // Border pulsing loop - only in camera stage, not during verifying
  useEffect(() => {
    if (stage === 'camera') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [stage]);

  // Laser scanning animation loop
  useEffect(() => {
    if (stage === 'verifying') {
      const laser = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      laser.start();
      return () => laser.stop();
    }
  }, [stage]);

  const scanTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260], // Container height matches 260
  });

  const handleStartScan = async () => {
    // Get voter ID from stored credentials (for login mode) or current voter (for enrollment mode)
    let voterId = voter?.voterId;
    
    if (!voterId) {
      // Login mode: get voter ID from stored credentials
      const credentials = await getBiometricCredentials();
      voterId = credentials?.voterId;
      
      if (!voterId) {
        // No credentials and not authenticated - redirect to login
        Alert.alert(
          'Credentials Required',
          'Please sign in with your ID and password first to enable biometric login.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
        return;
      }
    }
    
    console.log('Voter ID:', voterId);
    if (stage === 'permission') {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Camera Required',
          'OndoDecide needs your camera to scan and enroll your facial biometrics.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    if (!cameraRef.current) return;

    try {
      // Capture from native CameraView
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });
      if (!photo?.uri) throw new Error('Capture failed');

      setStage('verifying');

      // Verify photo against profile database
      const result = await electionService.verifyBiometric(voterId || '', photo.uri);

      if (result.matched) {
        setStage('success');
        
        // Check if this is a login attempt (no authenticated user)
        if (!voter) {
          // Login with stored credentials after successful face verification
          const credentials = await getBiometricCredentials();
          if (credentials) {
            const loginSuccess = await login(credentials);
            if (loginSuccess) {
              setBiometricVerified(true);
              router.replace('/(app)/dashboard');
            } else {
              router.replace('/(auth)/login');
            }
          } else {
            // No credentials stored, redirect to login
            router.replace('/(auth)/login');
          }
        } else {
          // Enrollment mode - go to biometric setup
          router.replace('/(auth)/biometric');
        }
      } else {
        setStage('camera');
        Alert.alert(
          'Scan Failed',
          result.message || 'Face details did not match voter record profile. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Biometric verification request error:', err);
      setStage('camera');
      Alert.alert(
        'Verification Connection Error',
        'Could not contact secure verification services. Please check connection and retry.',
        [{ text: 'Retry' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.logoRow}>
          <Ionicons name="shield" size={24} color="#ffb597" />
          <Text style={styles.appBarTitle}>OndoDecide</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color="#e1bfb2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Tracker Banner - Only show in enrollment mode */}
        {voter && (
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Ionicons name="checkmark-circle" size={18} color="#a1d494" />
              <Text style={[styles.progressText, styles.textCompleted]}>Verified ID</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <View style={styles.progressPulseDot} />
              <Text style={[styles.progressText, styles.textActive]}>Biometric Link</Text>
            </View>
          </View>
        )}

        {/* Login Mode Header - Only show in login mode */}
        {!voter && (
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>Face Login</Text>
            <Text style={styles.loginSubtitle}>Position your face within the frame to verify your identity</Text>
          </View>
        )}



        {/* Camera / Scan Frame Section */}
        <View style={styles.scannerViewport}>
          {/* Outer focus corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Glowing scanner ring */}
          <Animated.View
            style={[
              styles.scannerRing,
              { transform: [{ scale: pulseAnim }] },
              stage === 'success' && styles.ringSuccess,
            ]}
          >
            <View style={styles.scannerRingInner}>
              {/* Permission placeholder */}
              {stage === 'permission' && (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera-reverse" size={56} color="#ffb597" />
                  <Text style={styles.placeholderText}>Camera Permission Required</Text>
                </View>
              )}

              {/* Live Front Camera Stream */}
              {(stage === 'camera' || stage === 'verifying') && (
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  facing="front"
                />
              )}

              {/* Vertical Laser scanning line overlay */}
              {stage === 'verifying' && (
                <View style={StyleSheet.absoluteFill}>
                  <Animated.View
                    style={[
                      styles.scanLine,
                      { transform: [{ translateY: scanTranslateY }] },
                    ]}
                  />
                  <View style={styles.scanningShieldMask} />
                </View>
              )}

              {/* Successful check status overlay */}
              {stage === 'success' && (
                <View style={styles.successOverlay}>
                  <Ionicons name="checkmark-circle" size={80} color="#a1d494" />
                  <Text style={styles.successOverlayText}>
                    {voter ? 'Enrollment Complete' : 'Login Successful'}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Informative tips cards */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsCard}>
            <View style={[styles.tipsIconContainer, styles.iconContainerBgPrimary]}>
              <Ionicons name="bulb" size={20} color="#ffb597" />
            </View>
            <View style={styles.tipsTextContainer}>
              <Text style={styles.tipsTitle}>Optimal Lighting</Text>
              <Text style={styles.tipsDesc}>
                Ensure your face is evenly lit and avoid strong backlighting.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.actionSection}>
          {/* Only show scan button when not in success stage */}
          {stage !== 'success' && (
            <TouchableOpacity
              style={[
                styles.scanActionButton,
                stage === 'verifying' && styles.buttonVerifying,
              ]}
              onPress={handleStartScan}
              disabled={stage === 'verifying'}
              activeOpacity={0.8}
            >
              {stage === 'verifying' ? (
                <ActivityIndicator color="#4e1900" size="small" />
              ) : (
                <>
                  <Text style={styles.scanActionButtonText}>
                    {stage === 'permission'
                      ? 'Grant Camera Permission'
                      : 'Start Scan'}
                  </Text>
                  <Ionicons name="qr-code-outline" size={18} color="#4e1900" />
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Only show skip button in enrollment mode, not login mode */}
          {voter && stage !== 'success' && (
            <TouchableOpacity
              style={styles.skipActionButton}
              onPress={() => router.replace('/(auth)/biometric')}
              activeOpacity={0.7}
            >
              <Text style={styles.skipActionButtonText}>I'll do this later</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  notificationButton: {
    padding: 6,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textCompleted: {
    color: '#a1d494',
  },
  textActive: {
    color: '#ffb597',
  },
  progressDivider: {
    flexGrow: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
  },
  progressPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffb597',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f7ddd4',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#e1bfb2',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f7ddd4',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#e1bfb2',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  scannerViewport: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: '#ffb597',
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
  },
  scannerRingInner: {
    flex: 1,
    borderRadius: 126,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1d100b',
  },
  ringSuccess: {
    borderColor: '#a1d494',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    color: '#e1bfb2',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ffb597',
    shadowColor: '#ffb597',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 20,
  },
  scanningShieldMask: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 181, 151, 0.05)',
  },
  successOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(29, 16, 11, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  successOverlayText: {
    color: '#a1d494',
    fontSize: 16,
    fontWeight: '700',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#ffb597',
    borderWidth: 2,
    opacity: 0.4,
  },
  cornerTL: {
    top: -10,
    left: -10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: -10,
    right: -10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: -10,
    left: -10,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: -10,
    right: -10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  tipsSection: {
    gap: 16,
    marginBottom: 32,
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  tipsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerBgPrimary: {
    backgroundColor: 'rgba(242, 100, 26, 0.15)',
  },
  iconContainerBgTertiary: {
    backgroundColor: 'rgba(72, 143, 255, 0.15)',
  },
  tipsTextContainer: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7ddd4',
    marginBottom: 2,
  },
  tipsDesc: {
    fontSize: 12,
    color: '#e1bfb2',
    lineHeight: 16,
  },
  actionSection: {
    gap: 12,
  },
  scanActionButton: {
    backgroundColor: '#f2641a',
    height: 50,
    borderRadius: 12,
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
  buttonVerifying: {
    backgroundColor: 'rgba(242, 100, 26, 0.6)',
  },
  buttonSuccess: {
    backgroundColor: '#a1d494',
    shadowColor: '#a1d494',
  },
  scanActionButtonText: {
    color: '#4e1900',
    fontSize: 16,
    fontWeight: '700',
  },
  skipActionButton: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  skipActionButtonText: {
    color: '#e1bfb2',
    fontSize: 14,
    fontWeight: '600',
  },
});
