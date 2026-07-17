import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useBiometric } from '@/hooks/useBiometric';
import { useAuthStore } from '@/store/useAuthStore';
import { electionService } from '@/services/electionService';
import { BackArrow } from '@/components';
import * as SecureStore from 'expo-secure-store';

type ActiveMode = 'menu' | 'fingerprint' | 'face';
type FaceStage = 'camera' | 'verifying' | 'success';

export default function BiometricsTabScreen() {
  const router = useRouter();
  const voter = useAuthStore((s) => s.voter);
  const [activeMode, setActiveMode] = useState<ActiveMode>('menu');

  // --- Fingerprint Verification Setup Hook ---
  const {
    isAvailable,
    isEnrolled,
    biometricType,
    error: biometricError,
    authenticate,
  } = useBiometric();

  const [fingerprintAuthenticating, setFingerprintAuthenticating] = useState(false);
  const [fingerprintSuccess, setFingerprintSuccess] = useState(false);

  // Fingerprint Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.15)).current;

  // --- Face Scanning Setup ---
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [faceStage, setFaceStage] = useState<FaceStage>('camera');
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const facePulseAnim = useRef(new Animated.Value(1)).current;

  const [faceSuccess, setFaceSuccess] = useState(false);

  useEffect(() => {
    const checkFaceStatus = async () => {
      if (voter?.voterId) {
        const enrolled = await SecureStore.getItemAsync(`face_enrolled_${voter.voterId}`);
        if (enrolled === 'true') {
          setFaceSuccess(true);
        }
      }
    };
    checkFaceStatus();
  }, [voter]);

  // Setup Fingerprint Animations on start
  useEffect(() => {
    let pulse: Animated.CompositeAnimation | null = null;
    let glow: Animated.CompositeAnimation | null = null;

    if (activeMode === 'fingerprint') {
      pulse = Animated.loop(
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

      glow = Animated.loop(
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
    }

    return () => {
      pulse?.stop();
      glow?.stop();
    };
  }, [activeMode]);

  // Setup Face Scanner Animations
  useEffect(() => {
    let pulse: Animated.CompositeAnimation | null = null;
    let laser: Animated.CompositeAnimation | null = null;

    if (activeMode === 'face') {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(facePulseAnim, {
            toValue: 1.04,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(facePulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      if (faceStage === 'verifying') {
        laser = Animated.loop(
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
      }
    }

    return () => {
      pulse?.stop();
      laser?.stop();
    };
  }, [activeMode, faceStage]);

  const scanTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  // --- Fingerprint verification handler ---
  const handleFingerprintRegister = async () => {
    setFingerprintAuthenticating(true);
    const success = await authenticate();
    setFingerprintAuthenticating(false);
    if (success) {
      setFingerprintSuccess(true);
      Alert.alert(
        'Fingerprint Linked',
        'Your fingerprint is now securely registered for biometric voting authorization.',
        [{ text: 'OK', onPress: () => { setFingerprintSuccess(false); setActiveMode('menu'); } }]
      );
    }
  };

  // --- Face scanning handler ---
  const handleFaceRegister = async () => {
    const voterId = voter?.voterId;
    
    console.log('Voter ID:', voterId);
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert(
          'Permission Denied',
          'OndoDecide requires camera access to scan and register your face.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75, skipProcessing: false });
      if (!photo?.uri) throw new Error('Capture failed');

      setFaceStage('verifying');

      console.log("hello world");
      
      // Verify and register the photo
      const result = await electionService.verifyBiometric(voterId || '', photo.uri);

      if (result.matched) {
        setFaceStage('success');
        setFaceSuccess(true);
        if (voterId) {
          await SecureStore.setItemAsync(`face_enrolled_${voterId}`, 'true');
        }
        setTimeout(() => {
          Alert.alert(
            'Facial ID Enrolled',
            'Your facial biometrics have been successfully linked to your secure ballot.',
            [{ text: 'Continue', onPress: () => { setFaceStage('camera'); setActiveMode('menu'); } }]
          );
        }, 800);
      } else {
        setFaceStage('camera');
        Alert.alert(
          'Verification Failed',
          result.message || 'The captured face did not match your registered profile photo. Please try again.',
          [{ text: 'Retry' }]
        );
      }
    } catch (err) {
      console.error(err);
      setFaceStage('camera');
      Alert.alert(
        'Connection Error',
        'Could not communicate with secure verification microservice. Please check connection and retry.',
        [{ text: 'Retry' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.headerBar}>
        {activeMode !== 'menu' ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveMode('menu');
              setFaceStage('camera');
            }}
          >
            <BackArrow size={24} color="#f7ddd4" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBox} />
        )}
        <Text style={styles.headerTitle}>
          {activeMode === 'menu'
            ? 'Manage Biometrics'
            : activeMode === 'fingerprint'
              ? 'Register Fingerprint'
              : 'Register Face Scan'}
        </Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* MODE 1: CHOICE MENU */}
        {activeMode === 'menu' && (
          <View style={styles.menuContainer}>
            <Text style={styles.menuSub}>
              Ensure secure, one-click access and cast your secure ballot with biometric validation.
            </Text>

            {/* Fingerprint panel option */}
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => setActiveMode('fingerprint')}
              activeOpacity={0.8}
            >
              <View style={[
                styles.menuIconCircle, 
                { backgroundColor: isEnrolled ? 'rgba(161, 212, 148, 0.15)' : 'rgba(242, 100, 26, 0.15)' }
              ]}>
                {isEnrolled ? (
                  <Ionicons name="checkmark-circle" size={32} color="#a1d494" />
                ) : (
                  <Ionicons name="finger-print" size={32} color="#f2641a" />
                )}
              </View>
              <View style={styles.menuTextSection}>
                <Text style={styles.menuCardTitle}>Register Fingerprint</Text>
                <Text style={styles.menuCardDesc}>
                  Link hardware fingerprint credentials to authenticate your ballot casts instantly.
                </Text>
              </View>
              {isEnrolled ? (
                <Ionicons name="checkmark-circle" size={20} color="#a1d494" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#e1bfb2" />
              )}
            </TouchableOpacity>

            {/* Face scan panel option */}
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => {
                if (cameraPermission?.granted) {
                  setActiveMode('face');
                } else {
                  requestCameraPermission().then((res) => {
                    if (res.granted) setActiveMode('face');
                  });
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[
                styles.menuIconCircle, 
                { backgroundColor: faceSuccess ? 'rgba(161, 212, 148, 0.15)' : 'rgba(123, 175, 212, 0.15)' }
              ]}>
                {faceSuccess ? (
                  <Ionicons name="checkmark-circle" size={32} color="#a1d494" />
                ) : (
                  <Ionicons name="scan" size={32} color="#7bafd4" />
                )}
              </View>
              <View style={styles.menuTextSection}>
                <Text style={styles.menuCardTitle}>Register Facial ID</Text>
                <Text style={styles.menuCardDesc}>
                  Perform a 3D camera facial scan to enroll and protect your voter identity.
                </Text>
              </View>
              {faceSuccess ? (
                <Ionicons name="checkmark-circle" size={20} color="#a1d494" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#e1bfb2" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* MODE 2: FINGERPRINT REGISTRATION */}
        {activeMode === 'fingerprint' && (
          <View style={styles.flowContainer}>
            <View style={styles.scannerWrapper}>
              <Animated.View
                style={[
                  styles.ambientGlow,
                  { opacity: glowAnim, transform: [{ scale: pulseAnim }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.scannerFrame,
                  { transform: [{ scale: pulseAnim }] },
                  (isEnrolled || fingerprintSuccess) && { borderColor: '#a1d494' }
                ]}
              >
                {isEnrolled || fingerprintSuccess ? (
                  <Ionicons name="checkmark-circle" size={100} color="#a1d494" />
                ) : (
                  <Ionicons name="finger-print" size={100} color="#f2641a" />
                )}
              </Animated.View>
            </View>

            <Text style={styles.flowHeading}>
              {isEnrolled || fingerprintSuccess ? 'Fingerprint Linked' : (isAvailable && isEnrolled ? 'Scan Fingerprint Sensor' : 'Hardware Setup Required')}
            </Text>
            <Text style={styles.flowSubText}>
              {isEnrolled || fingerprintSuccess
                ? 'Your device fingerprint is successfully linked and verified.'
                : 'Place your registered finger on your device\'s fingerprint sensor to authorize access.'}
            </Text>

            <View style={styles.actionsBox}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (fingerprintAuthenticating || fingerprintSuccess || isEnrolled) && {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    shadowOpacity: 0,
                    elevation: 0,
                  }
                ]}
                onPress={handleFingerprintRegister}
                disabled={fingerprintAuthenticating || fingerprintSuccess || isEnrolled}
              >
                {fingerprintAuthenticating ? (
                  <ActivityIndicator color="#e1bfb2" size="small" />
                ) : (
                  <>
                    <Text style={[
                      styles.primaryBtnText,
                      (fingerprintSuccess || isEnrolled) && { color: 'rgba(255, 255, 255, 0.4)' }
                    ]}>
                      {fingerprintSuccess || isEnrolled ? 'Fingerprint Linked' : 'Verify and Enroll Touch ID'}
                    </Text>
                    <Ionicons
                      name="finger-print"
                      size={18}
                      color={fingerprintSuccess || isEnrolled ? 'rgba(255, 255, 255, 0.4)' : '#4e1900'}
                    />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setActiveMode('menu')}
              >
                <Text style={styles.cancelBtnText}>Back to Options</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MODE 3: FACE SCAN REGISTRATION */}
        {activeMode === 'face' && (
          <View style={styles.flowContainer}>
            {faceStage === 'camera' && (
              <View style={styles.cameraViewport}>
                <CameraView style={styles.camera} ref={cameraRef} facing="front" />
                <View style={styles.cameraBorder} />
              </View>
            )}

            {faceStage === 'verifying' && (
              <View style={styles.cameraViewport}>
                <CameraView style={styles.camera} ref={cameraRef} facing="front" />
                <Animated.View
                  style={[styles.scanLaser, { transform: [{ translateY: scanTranslateY }] }]}
                />
                <View style={styles.loaderWrap}>
                  <ActivityIndicator size="large" color="#7bafd4" />
                  <Text style={styles.verifyingText}>Verifying Face Profile...</Text>
                </View>
              </View>
            )}

            {faceStage === 'success' && (
              <View style={styles.successViewport}>
                <Ionicons name="checkmark-circle" size={80} color="#a1d494" />
                <Text style={styles.successText}>Scan Complete!</Text>
              </View>
            )}

            <Text style={styles.flowHeading}>
              {faceStage === 'camera'
                ? 'Align face inside scanner'
                : faceStage === 'verifying'
                  ? 'Analyzing facial landmarks'
                  : 'Enrollment successful!'}
            </Text>
            <Text style={styles.flowSubText}>
              Ensure you are in a well-lit environment and remove any glasses or hats before scanning.
            </Text>

            <View style={styles.actionsBox}>
              {faceStage === 'camera' && (
                <TouchableOpacity style={styles.primaryBtn} onPress={handleFaceRegister}>
                  <Text style={styles.primaryBtnText}>Capture and Scan Face</Text>
                  <Ionicons name="camera" size={18} color="#4e1900" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setActiveMode('menu');
                  setFaceStage('camera');
                }}
              >
                <Text style={styles.cancelBtnText}>Back to Options</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  placeholderBox: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#f7ddd4',
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  // --- Choice Menu Styles ---
  menuContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: 16,
  },
  menuSub: {
    fontSize: 14,
    color: '#e1bfb2',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  menuIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextSection: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f7ddd4',
    marginBottom: 4,
  },
  menuCardDesc: {
    fontSize: 12,
    color: '#e1bfb2',
    lineHeight: 16,
  },
  // --- Flow Container Styles ---
  flowContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 440,
    marginTop: 24,
  },
  scannerWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 240,
    height: 240,
    marginBottom: 24,
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
    backgroundColor: '#261813',
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
  flowHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7ddd4',
    textAlign: 'center',
    marginBottom: 8,
  },
  flowSubText: {
    fontSize: 14,
    color: '#e1bfb2',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  actionsBox: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#f2641a',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#4e1900',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    color: '#e1bfb2',
    fontSize: 14,
    fontWeight: '600',
  },
  // --- Camera View Styles ---
  cameraViewport: {
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(123, 175, 212, 0.3)',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: '#7bafd4',
  },
  scanLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#7bafd4',
    shadowColor: '#7bafd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  loaderWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  verifyingText: {
    color: '#7bafd4',
    fontSize: 14,
    fontWeight: '600',
  },
  successViewport: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: '#a1d494',
    backgroundColor: 'rgba(161, 212, 148, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  successText: {
    color: '#a1d494',
    fontSize: 18,
    fontWeight: '700',
  },
});
