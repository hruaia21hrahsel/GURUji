import '../global.css';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { usePinStore } from '@/store/usePinStore';
import { supabase } from '@/lib/supabase';
import { syncProfileToSupabase } from '@/lib/auth';
import { getPin } from '@/lib/pin';
import type { AuthProvider } from '@/lib/types';

export default function RootLayout() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isLocked = usePinStore((s) => s.isLocked);
  const hasPin = usePinStore((s) => s.hasPin);

  useEffect(() => {
    // On mount: initialize PIN state from SecureStore
    getPin().then((pin) => {
      usePinStore.getState().setHasPin(!!pin);
    });
  }, []);

  useEffect(() => {
    // AppState listener: re-lock on foreground (background -> active transition)
    // and start/stop Supabase auto-refresh
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
        // Re-lock the app whenever it comes back to foreground
        if (usePinStore.getState().hasPin) {
          usePinStore.getState().lock();
        }
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

  // Guard 1: Onboarding not complete
  if (!isOnboarded) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
      </Stack>
    );
  }

  // Guard 2: Not authenticated — show auth stack
  if (isOnboarded && !isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
      </Stack>
    );
  }

  // Guard 3: Authenticated but no PIN — go to PIN setup
  if (isAuthenticated && !hasPin) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/pin-setup" />
      </Stack>
    );
  }

  // Guard 4: Has PIN but locked — show PIN entry
  if (isAuthenticated && hasPin && isLocked) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="pin" />
      </Stack>
    );
  }

  // Guard 5: Authenticated, has PIN, unlocked — show tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
