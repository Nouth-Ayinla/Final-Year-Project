/**
 * Support Screen
 * FAQs and contact information for voters needing help.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants/Colors';

const FAQS = [
  {
    id: '1',
    question: 'How do I activate my account?',
    answer:
      'Your Voter ID and 6-digit activation PIN were sent to your email when an electoral officer registered you. Go to the login screen, tap "Activate your account", and enter those credentials to set your password.',
  },
  {
    id: '2',
    question: 'I forgot my password. What do I do?',
    answer:
      'Contact your nearest electoral office with valid ID. An officer will reset your account and resend your activation credentials.',
  },
  {
    id: '3',
    question: 'Why can\'t I see any elections?',
    answer:
      'Elections are only visible when they are in ACTIVE or UPCOMING status. If no elections appear, there are currently no scheduled elections. Pull down to refresh the elections screen.',
  },
  {
    id: '4',
    question: 'Can I change my vote after submitting?',
    answer:
      'No. Votes are final and cannot be changed once submitted. The system enforces one vote per voter per election to maintain integrity.',
  },
  {
    id: '5',
    question: 'Is my vote anonymous?',
    answer:
      'Yes. Your vote is recorded securely and linked only to your voter ID internally. Results display only aggregate counts — no individual vote attribution is publicly accessible.',
  },
  {
    id: '6',
    question: 'My biometric verification keeps failing.',
    answer:
      'Make sure you have a fingerprint enrolled in your device settings. Clean your finger and the sensor, then try again. If the problem persists, ensure you are using the same finger enrolled on the device.',
  },
  {
    id: '7',
    question: 'I did not receive my activation email.',
    answer:
      'Check your spam/junk folder first. If it is not there, contact the electoral officer who registered you to verify your email address is correct and request a re-send.',
  },
];

const CONTACT = [
  {
    id: 'email',
    icon: 'mail-outline' as const,
    label: 'Email Support',
    value: 'shawolhorizon@gmail.com',
    onPress: () => Linking.openURL('mailto:shawolhorizon@gmail.com'),
  },
  {
    id: 'phone',
    icon: 'call-outline' as const,
    label: 'Helpline',
    value: '08072008707',
    onPress: () =>
      Alert.alert('Call Support', 'Do you want to call 08072008707?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:08072008707') },
      ]),
  },
  {
    id: 'hours',
    icon: 'time-outline' as const,
    label: 'Office Hours',
    value: 'Mon – Fri, 8am – 5pm WAT',
    onPress: undefined,
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setOpen((prev) => !prev)}
      activeOpacity={0.8}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.primary}
        />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Support</Text>
          <Text style={styles.subtitle}>How can we help you?</Text>
        </View>

        {/* Contact Cards */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {CONTACT.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            activeOpacity={item.onPress ? 0.75 : 1}
            disabled={!item.onPress}
          >
            <GlassCard variant="elevated" style={styles.contactCard}>
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Ionicons name={item.icon} size={20} color={Colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{item.label}</Text>
                  <Text style={styles.contactValue}>{item.value}</Text>
                </View>
                {item.onPress && (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.textMuted}
                  />
                )}
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
          Frequently Asked Questions
        </Text>
        <GlassCard variant="elevated" style={styles.faqCard}>
          {FAQS.map((faq, index) => (
            <View key={faq.id}>
              <FaqItem question={faq.question} answer={faq.answer} />
              {index < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </GlassCard>

        {/* Footer note */}
        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={14}
            color={Colors.textMuted}
          />
          <Text style={styles.footerText}>
            OndoDecide is operated by the Electoral Commission. All data is handled
            in accordance with NDPR guidelines.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Contact
  contactCard: { marginBottom: Spacing.sm, padding: Spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },

  // FAQ
  faqCard: { padding: 0, overflow: 'hidden' },
  faqItem: { padding: Spacing.md },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  faqQuestion: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    opacity: 0.6,
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
});
