/**
 * App group layout — wraps authenticated screens with tab navigation.
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes } from '@/constants/Colors';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vote"
        options={{
          title: 'Vote',
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkmark-done-circle" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="biometrics"
        options={{
          title: 'Biometrics',
          tabBarIcon: ({ color }) => (
            <Ionicons name="finger-print" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={20} color={color} />
          ),
        }}
      />
      {/* Hide nested election screens from the tab bar */}
      <Tabs.Screen name="elections/[electionId]" options={{ href: null }} />
      <Tabs.Screen name="elections/[electionId]/[candidateId]" options={{ href: null }} />
      {/* Support — accessed via dashboard quick action, not a persistent tab */}
      <Tabs.Screen name="support" options={{ href: null }} />
      {/* Results — accessed via dashboard quick action or main links, not a persistent tab */}
      <Tabs.Screen name="results" options={{ href: null }} />
      <Tabs.Screen name="results/[electionId]" options={{ href: null }} />
    </Tabs>
  );
}
