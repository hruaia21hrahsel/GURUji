/**
 * Tests for Google Sign-In auth helper.
 * AUTH-02: Google sign-in calls GoogleSignin.signIn then supabase.auth.signInWithIdToken.
 * Gracefully handles Expo Go crash scenario.
 */

import { signInWithGoogle } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() =>
      Promise.resolve({
        data: { idToken: 'mock-google-id-token-abc123' },
      })
    ),
  },
}));

describe('signInWithGoogle', () => {
  beforeEach(() => {
    // Set env var for Google Web Client ID
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'mock-web-client-id.apps.googleusercontent.com';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  });

  it('calls GoogleSignin.signIn then supabase.auth.signInWithIdToken', async () => {
    const result = await signInWithGoogle();

    expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'mock-google-id-token-abc123',
    });
    expect(result.error).toBeNull();
  });

  it('configures GoogleSignin with the web client ID from env', async () => {
    await signInWithGoogle();

    expect(GoogleSignin.configure).toHaveBeenCalledWith({
      webClientId: 'mock-web-client-id.apps.googleusercontent.com',
    });
  });

  it('returns friendly error when EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set', async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    const result = await signInWithGoogle();

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toMatch(/not configured/i);
    expect(supabase.auth.signInWithIdToken).not.toHaveBeenCalled();
  });

  it('returns friendly error if GoogleSignin throws (Expo Go scenario)', async () => {
    (GoogleSignin.signIn as jest.Mock).mockRejectedValueOnce(
      new Error('Google Sign-In is not available in Expo Go')
    );

    const result = await signInWithGoogle();

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toContain('Google Sign-In is not available in Expo Go');
    // Should not crash — graceful error return
    expect(result.data).toBeNull();
  });

  it('returns friendly error if hasPlayServices throws', async () => {
    (GoogleSignin.hasPlayServices as jest.Mock).mockRejectedValueOnce(
      new Error('Play Services not available')
    );

    const result = await signInWithGoogle();

    expect(result.error).not.toBeNull();
    expect(result.data).toBeNull();
  });
});
