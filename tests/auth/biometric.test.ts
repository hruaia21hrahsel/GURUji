/**
 * Tests for biometric auth functions in lib/pin.ts
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { checkBiometricAvailability, authenticateWithBiometric } from '@/lib/pin';

// Override the global mocks with fresh implementations for each test
beforeEach(() => {
  (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
  (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
  (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });
});

describe('checkBiometricAvailability', () => {
  it('returns false when hardware is not available', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

    const result = await checkBiometricAvailability();
    expect(result).toBe(false);
  });

  it('returns false when hardware is available but not enrolled', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

    const result = await checkBiometricAvailability();
    expect(result).toBe(false);
  });

  it('returns true when hardware is available AND enrolled', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

    const result = await checkBiometricAvailability();
    expect(result).toBe(true);
  });

  it('does not call isEnrolledAsync when hardware is not available', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

    await checkBiometricAvailability();
    expect(LocalAuthentication.isEnrolledAsync).not.toHaveBeenCalled();
  });
});

describe('authenticateWithBiometric', () => {
  it('returns true when authentication succeeds', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: true,
    });

    const result = await authenticateWithBiometric();
    expect(result).toBe(true);
  });

  it('returns false when authentication fails', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });

    const result = await authenticateWithBiometric();
    expect(result).toBe(false);
  });

  it('calls authenticateAsync with the correct prompt message', async () => {
    await authenticateWithBiometric();

    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: 'Unlock GURUji' })
    );
  });
});
