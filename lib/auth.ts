import { supabase } from './supabase';
import { useAppStore } from '@/store/useAppStore';
import { usePinStore } from '@/store/usePinStore';

/**
 * syncProfileToSupabase: Upserts the student's class/board/language to the
 * Supabase profiles table after authentication.
 * Called on SIGNED_IN auth event (AUTH-05).
 */
export async function syncProfileToSupabase(userId: string): Promise<void> {
  const { class: studentClass, board, language } = useAppStore.getState();

  if (!studentClass || !board || !language) {
    // Profile not yet set — onboarding may not be complete
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        class: studentClass,
        board,
        language,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('[GURUji] Profile sync failed:', error);
  }
}

/**
 * signOut: Signs out the user, clears auth state, and resets PIN state.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[GURUji] Sign out error:', error);
  }
  useAppStore.getState().clearAuth();
  usePinStore.getState().reset();
}
