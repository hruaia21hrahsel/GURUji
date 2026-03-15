import '../global.css';
import { useEffect } from 'react';
import { AppState, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { syncProfileToSupabase } from '@/lib/auth';
import type { AuthProvider } from '@/lib/types';

export default function RootLayout() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    // AppState listener: start/stop auto-refresh on foreground/background
    // Pattern 4 from research — required for non-web platforms
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Supabase auth state listener — updates Zustand on SIGNED_IN/SIGNED_OUT
    // Also calls getSession to catch the INITIAL_SESSION event (Pitfall 5)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        useAppStore.getState().setAuth({
          userId: session.user.id,
          isAuthenticated: true,
          authProvider: (session.user.app_metadata.provider as AuthProvider) ?? 'email',
        });
        syncProfileToSupabase(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        useAppStore.getState().setAuth({
          userId: session.user.id,
          isAuthenticated: true,
          authProvider: (session.user.app_metadata.provider as AuthProvider) ?? 'email',
        });
        syncProfileToSupabase(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        useAppStore.getState().clearAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isOnboarded) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
      </Stack>
    );
  }

  if (isOnboarded && !isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Sign In</Text>
        <Text className="text-base text-gray-500 text-center">
          Auth screen coming in Plan 02
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
