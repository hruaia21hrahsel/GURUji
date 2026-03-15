/**
 * Tests for LargeSecureStore — AES-256 hybrid session storage adapter.
 * AUTH-04: Session persists across app restarts.
 */

import { LargeSecureStore } from '@/lib/large-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Mock crypto.getRandomValues for Node.js test environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
  configurable: true,
});

describe('LargeSecureStore', () => {
  let store: LargeSecureStore;

  beforeEach(() => {
    store = new LargeSecureStore();
  });

  it('setItem stores encrypted value in AsyncStorage and key in SecureStore', async () => {
    const key = 'supabase.auth.token';
    const value = 'test-session-data-that-is-long-enough-to-test-encryption';

    await store.setItem(key, value);

    // AsyncStorage should have something stored (encrypted, not plaintext)
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));
    // SecureStore should have the encryption key stored
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(key, expect.any(String));

    // The stored value should NOT be the plaintext original
    const storedValue = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    expect(storedValue).not.toBe(value);
  });

  it('getItem decrypts and returns the original value', async () => {
    const key = 'supabase.auth.token';
    const originalValue = 'my-secret-session-data-to-encrypt-and-decrypt';

    await store.setItem(key, originalValue);
    const retrieved = await store.getItem(key);

    expect(retrieved).toBe(originalValue);
  });

  it('removeItem clears both AsyncStorage and SecureStore', async () => {
    const key = 'supabase.auth.token';
    await store.setItem(key, 'some-value');

    await store.removeItem(key);

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
  });

  it('getItem returns null for non-existent key', async () => {
    const result = await store.getItem('nonexistent-key');
    expect(result).toBeNull();
  });

  it('stores and retrieves a large session token (simulating Supabase session)', async () => {
    const key = 'supabase.auth.token';
    // Simulate a large JSON session token (Supabase tokens are 2-4KB)
    const largeValue = JSON.stringify({
      access_token: 'a'.repeat(500),
      refresh_token: 'b'.repeat(200),
      expires_at: Date.now() + 3600000,
      user: { id: 'user-123', email: 'student@example.com' },
    });

    await store.setItem(key, largeValue);
    const retrieved = await store.getItem(key);

    expect(retrieved).toBe(largeValue);
  });
});
