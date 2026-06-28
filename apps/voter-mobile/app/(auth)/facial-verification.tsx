/**
 * Facial Verification Screen (MOCK)
 *
 * Flow: Activate Account → [this screen] → Biometric → Dashboard
 *
 * Current state: AI model not yet trained. This screen simulates the flow:
 *   1. Request camera permission
 *   2. Show live camera preview with a face-oval guide
 *   3. Voter taps "Capture" — shows a 3-second "Verifying…" animation
 *   4. Always succeeds (mock) and advances to biometric screen
 *
 * When the real AI model is ready, replace the mock verification
 * in `runMockVerification()` with a real API call that sends the
 * captured photo URI to the model endpoint.
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
} from 'react-native';
import { electionService } from '@/services/electionService';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';

type Stage = 'permission' | 'camera' | 'verifying' | 'success' | 'failed';

export default function FacialVerificationScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('permission');

  // Pulse animation for the face oval during camera stage
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Spin animation during verification
  const spinAnim  = useRef(new Animated.Value(0)).current;
  // Scale-in for success tick
  const successAnim = useRef(new Animated.Value(0)).current;

  // ── Animations ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage === 'camera') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'verifying') {
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      );
      spin.start();
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'success') {
      Animated.spring(successAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [stage]);

  // ── Permission handling ───────────────────────────────────────────────────
  useEffect(() => {
    if (permission?.granted) setStage('camera');
    else if (permission !== null && !permission.granted && !permission.canAskAgain) {
      setStage('permission');
    }
  }, [permission]);

  // ── Mock AI verification ──────────────────────────────────────────────────
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      // Capture the picture from native camera view
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) throw new Error("Capture failed");

      setStage('verifying');

      // Call Express API endpoint to proxy verification requests
      const result = await electionService.verifyBiometric("", photo.uri);

      if (result.success && result.matched) {
        setStage('success');
        setTimeout(() => router.replace('/(auth)/biometric'), 1500);
      } else {
        setStage('camera');
        Alert.alert(
          'Verification Failed',
          result.message || 'Face did not match the registered profile. Please try again.',
          [{ text: 'Retry', onPress: () => setStage('camera') }]
        );
      }
    } catch (err: any) {
      console.log("Biometric verification error:", err);
      setStage('camera');
      Alert.alert(
        'Error',
        'Could not complete face verification due to server connection error. Please try again.'
      );
    }
  };

  const handleDeny = () => {
    Alert.alert(
      'Camera Required',
      'Facial verification requires camera access. Please enable it in your device settings to continue.',
      [{ text: 'OK' }]
    );
  };

  const spinInterpolate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ── Render: Permission denied ─────────────────────────────────────────────
  if (stage === 'permission') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={52} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Camera Access</Text>
          <Text style={styles.subtitle}>
            OndoDecide needs your camera to verify your identity before you can log in.
            Your photo is never stored on our servers.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={async () => {
              const res = await requestPermission();
              if (!res.granted) handleDeny();
            }}
          >
            <Ionicons name="camera" size={20} color={Colors.textInverse} />
            <Text style={styles.primaryBtnText}>Allow Camera</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Verifying ─────────────────────────────────────────────────────
  if (stage === 'verifying') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spinInterpolate }] }]} />
          <View style={styles.spinnerInner}>
            <Ionicons name="scan" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Verifying…</Text>
          <Text style={styles.subtitle}>Matching your face with voter records</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Success ───────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: successAnim }] }]}>
            <Ionicons name="checkmark" size={56} color="#fff" />
          </Animated.View>
          <Text style={styles.title}>Identity Verified</Text>
          <Text style={styles.subtitle}>Welcome to OndoDecide. Setting up your session…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Camera ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Face Verification</Text>
          <Text style={styles.headerSub}>Position your face inside the oval</Text>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={'front' as CameraType}
        />

        {/* Dark overlay with oval cut-out effect */}
        <View style={styles.overlay} pointerEvents="none">
          {/* Top mask */}
          <View style={styles.maskTop} />
          {/* Middle row: side masks + oval border */}
          <View style={styles.maskMiddleRow}>
            <View style={styles.maskSide} />
            <Animated.View style={[styles.ovalGuide, { transform: [{ scale: pulseAnim }] }]}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </Animated.View>
            <View style={styles.maskSide} />
          </View>
          {/* Bottom mask */}
          <View style={styles.maskBottom} />
        </View>
      </View>

      {/* Instructions & capture button */}
      <View style={styles.controls}>
        <View style={styles.tips}>
          <TipRow icon="sunny-outline"    text="Good lighting — face a light source" />
          <TipRow icon="glasses-outline"  text="Remove glasses if possible" />
          <TipRow icon="move-outline"     text="Keep still and look straight ahead" />
        </View>

        <TouchableOpacity style={styles.captureBtn} activeOpacity={0.85} onPress={handleCapture}>
          <View style={styles.captureOuter}>
            <View style={styles.captureInner} />
          </View>
        </TouchableOpacity>
        <Text style={styles.captureLabel}>Tap to capture</Text>
      </View>
    </SafeAreaView>
  );
}

function TipRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.tipRow}>
      <Ionicons name={icon} size={14} color={Colors.primary} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const OVAL_W = 230;
const OVAL_H = 290;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Shared centred layout ───────────────────────────────────────────────
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl, fontWeight: '800',
    color: Colors.textPrimary, textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md, minHeight: 56,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    marginBottom: Spacing.lg,
  },
  primaryBtnText: { color: Colors.textInverse, fontSize: FontSizes.md, fontWeight: '700' },

  // ── Mock badge ──────────────────────────────────────────────────────────
  mockBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  mockText: { fontSize: FontSizes.xs, color: Colors.warning, fontWeight: '600' },
  mockBadgeInline: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  mockTextSmall: { fontSize: 10, color: Colors.warning, fontWeight: '700' },

  // ── Verifying spinner ───────────────────────────────────────────────────
  spinnerRing: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: Colors.primary,
    borderRightColor: 'transparent',
  },
  spinnerInner: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },

  // ── Success ──────────────────────────────────────────────────────────────
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },

  // ── Camera layout ────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },
  headerSub:   { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  cameraWrap: { flex: 1, position: 'relative' },

  // Overlay
  overlay:        { ...StyleSheet.absoluteFill, zIndex: 1 },
  maskTop:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  maskMiddleRow:  { flexDirection: 'row', height: OVAL_H },
  maskSide:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  maskBottom:     { flex: 1.2, backgroundColor: 'rgba(0,0,0,0.55)' },

  ovalGuide: {
    width: OVAL_W, height: OVAL_H,
    borderRadius: OVAL_W / 2,
    borderWidth: 2.5, borderColor: Colors.primary,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  // Corner accent marks
  corner: {
    position: 'absolute', width: 22, height: 22,
    borderColor: Colors.primaryLight, borderWidth: 3,
  },
  cornerTL: { top: 14, left: 14, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 14, right: 14, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 14, left: 14, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 14, right: 14, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },

  // Controls
  controls: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  tips: { marginBottom: Spacing.lg, gap: 6 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tipText: { fontSize: FontSizes.xs, color: Colors.textMuted },

  captureBtn: { alignSelf: 'center', marginBottom: Spacing.sm },
  captureOuter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  captureInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
  },
  captureLabel: {
    textAlign: 'center', fontSize: FontSizes.xs,
    color: Colors.textMuted, marginBottom: 4,
  },
});
