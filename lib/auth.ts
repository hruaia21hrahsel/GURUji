import { supabase } from './supabase';
import { useAppStore } from '@/store/useAppStore';
import { usePinStore } from '@/store/usePinStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// ----------------------------------------------------------------
// Identity type (subset of Supabase Identity)
// ----------------------------------------------------------------
export interface Identity {
  id: string;
  provider: string;
  identity_id: string;
  [key: string]: unknown;
}

// ----------------------------------------------------------------
// Type for all auth function returns — mirrors Supabase's pattern
// ----------------------------------------------------------------
export type AuthResult = { data: unknown; error: { message: string } | null };

// ----------------------------------------------------------------
// Phone OTP (AUTH-01)
// ----------------------------------------------------------------

/**
 * signInWithPhone: Sends an OTP to the given phone number.
 * Phone must be in E.164 format (e.g. +919876543210).
 */
export async function signInWithPhone(phoneNumber: string): Promise<AuthResult> {
  // Validate E.164 format — must start with + followed by digits only
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (!e164Regex.test(phoneNumber)) {
    return {
      data: null,
      error: { message: 'Phone number must be in E.164 format (e.g. +919876543210)' },
    };
  }

  const { data, error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
  return { data, error };
}

/**
 * verifyPhoneOtp: Verifies the 6-digit OTP sent to the phone number.
 */
export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  return { data, error };
}

// ----------------------------------------------------------------
// Google Sign-In (AUTH-02)
// ----------------------------------------------------------------

/**
 * signInWithGoogle: Signs in with Google using @react-native-google-signin/google-signin.
 * Gracefully handles Expo Go (crashes on native module calls) and missing env vars.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      return {
        data: null,
        error: {
          message:
            'Google Sign-In is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env.local.',
        },
      };
    }

    GoogleSignin.configure({ webClientId });

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();

    // Extract idToken from the response (v12+ shape: userInfo.data.idToken)
    const idToken =
      (userInfo as any)?.data?.idToken ?? (userInfo as any)?.idToken ?? null;

    if (!idToken) {
      return {
        data: null,
        error: { message: 'Google Sign-In did not return an ID token. Please try again.' },
      };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    return { data, error };
  } catch (err: unknown) {
    // Gracefully handle Expo Go crash, user cancellation, and Play Services errors
    const message =
      err instanceof Error ? err.message : 'Google Sign-In failed. Please try again.';
    return { data: null, error: { message } };
  }
}

// ----------------------------------------------------------------
// Email / Password (AUTH-03)
// ----------------------------------------------------------------

/**
 * signUpWithEmail: Creates a new account with email and password.
 * Validates email format and minimum password length before calling Supabase.
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { data: null, error: { message: 'Please enter a valid email address.' } };
  }

  // Validate password length
  if (password.length < 6) {
    return {
      data: null,
      error: { message: 'Password must be at least 6 characters.' },
    };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

/**
 * signInWithEmail: Signs in an existing account with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

/**
 * requestPasswordReset: Sends a magic-link / OTP to the email for password reset.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithOtp({ email });
  return { data, error };
}

/**
 * verifyEmailOtp: Verifies the OTP sent to the email address.
 */
export async function verifyEmailOtp(email: string, token: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  return { data, error };
}

// ----------------------------------------------------------------
// Shared helpers (from Plan 01)
// ----------------------------------------------------------------

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

// ----------------------------------------------------------------
// Settings auth management (Plan 03)
// ----------------------------------------------------------------

/**
 * getLinkedIdentities: Returns the list of auth identities linked to the
 * current user (phone, google, email, etc.).
 */
export async function getLinkedIdentities(): Promise<Identity[]> {
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) {
    console.error('[GURUji] Get identities error:', error);
    return [];
  }
  return ((data as any)?.identities ?? []) as Identity[];
}

/**
 * linkGoogleAccount: Links a Google identity to the current account.
 * If the Google account already belongs to another user, returns an error.
 */
export async function linkGoogleAccount(): Promise<AuthResult> {
  try {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      return {
        data: null,
        error: {
          message:
            'Google Sign-In is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env.local.',
        },
      };
    }

    GoogleSignin.configure({ webClientId });
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();

    const idToken =
      (userInfo as any)?.data?.idToken ?? (userInfo as any)?.idToken ?? null;

    if (!idToken) {
      return {
        data: null,
        error: { message: 'Google Sign-In did not return an ID token. Please try again.' },
      };
    }

    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { idToken } as any,
    });

    if (error) {
      // Handle duplicate identity — account exists on another user
      if (
        error.message?.toLowerCase().includes('already linked') ||
        error.message?.toLowerCase().includes('already exists')
      ) {
        return {
          data: null,
          error: { message: 'Account exists — log in with the original method' },
        };
      }
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to link Google account. Please try again.';
    return { data: null, error: { message } };
  }
}

/**
 * unlinkIdentity: Removes a linked identity from the current user.
 * Requires the user to have at least 2 identities (enforced client-side for UX).
 */
export async function unlinkIdentity(identityId: string): Promise<AuthResult> {
  // Client-side guard: fetch current identities
  const identities = await getLinkedIdentities();
  if (identities.length < 2) {
    return {
      data: null,
      error: {
        message:
          'Cannot remove your only sign-in method. Add another method first.',
      },
    };
  }

  const target = identities.find((id) => id.id === identityId || id.identity_id === identityId);
  if (!target) {
    return { data: null, error: { message: 'Identity not found.' } };
  }

  const { data, error } = await supabase.auth.unlinkIdentity(target as any);
  if (error) {
    return { data: null, error: { message: error.message } };
  }
  return { data, error: null };
}

/**
 * requestAccountDeletion: Sets deletion_requested_at on the profiles table,
 * then signs the user out. A scheduled function handles the 7-day wipe.
 */
export async function requestAccountDeletion(): Promise<void> {
  const userId = useAppStore.getState().userId;
  if (!userId) {
    console.error('[GURUji] requestAccountDeletion: no userId in store');
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('[GURUji] Account deletion request failed:', error);
  }

  await signOut();
}

/**
 * cancelAccountDeletion: Clears deletion_requested_at on the profiles table.
 */
export async function cancelAccountDeletion(): Promise<void> {
  const userId = useAppStore.getState().userId;
  if (!userId) return;

  const { error } = await supabase
    .from('profiles')
    .update({ deletion_requested_at: null })
    .eq('id', userId);

  if (error) {
    console.error('[GURUji] Cancel account deletion failed:', error);
  }
}
