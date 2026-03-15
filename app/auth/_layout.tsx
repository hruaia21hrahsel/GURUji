import { Stack } from 'expo-router';

/**
 * Auth stack layout — headerShown: false for all screens.
 * Auth screens manage their own visual chrome.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="email-form" />
    </Stack>
  );
}
