/**
 * Auth group layout — wraps login, activate, and biometric screens.
 */
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="activate" />
      <Stack.Screen name="biometric" />
    </Stack>
  );
}
