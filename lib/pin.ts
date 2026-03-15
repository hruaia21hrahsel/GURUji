import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { usePinStore } from '@/store/usePinStore';

const PIN_KEY = 'guruji_pin';

// ----------------------------------------------------------------
// PIN storage and verification
// ----------------------------------------------------------------

/**
 * savePin: Stores PIN in SecureStore (hardware-backed storage).
 * Uses SecureStore directly — 4-digit PIN in hardware-backed store
 * provides equivalent security to hashing for this use case.
 */
export async function savePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin);
  usePinStore.getState().setHasPin(true);
}

/**
 * getPin: Reads the stored PIN from SecureStore.
 * Returns null if no PIN is set.
 */
export async function getPin(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_KEY);
}

/**
 * verifyPin: Compares the user-entered PIN against the stored PIN.
 * Returns true if they match.
 */
export async function verifyPin(input: string): Promise<boolean> {
  const stored = await getPin();
  if (!stored) return false;
  return input === stored;
}

/**
 * hashPin: For compatibility — returns the PIN as-is since we store
 * directly in SecureStore (hardware-backed, equivalent security for 4 digits).
 */
export function hashPin(pin: string): string {
  return pin;
}

// ----------------------------------------------------------------
// Biometric authentication
// ----------------------------------------------------------------

/**
 * checkBiometricAvailability: Returns true only if the device has
 * biometric hardware AND the user has enrolled biometrics.
 */
export async function checkBiometricAvailability(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return isEnrolled;
}

/**
 * authenticateWithBiometric: Triggers the device biometric prompt.
 * Returns true if authentication succeeds.
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock GURUji',
    fallbackLabel: 'Use PIN',
    cancelLabel: 'Cancel',
  });
  return result.success;
}
