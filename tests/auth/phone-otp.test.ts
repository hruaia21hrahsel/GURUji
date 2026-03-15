/**
 * Tests for phone OTP auth helpers.
 * AUTH-01: phone OTP flow validates E.164 format, sends OTP, and verifies correctly.
 */

import { signInWithPhone, verifyPhoneOtp } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

describe('signInWithPhone', () => {
  it('calls supabase.auth.signInWithOtp with phone in E.164 format', async () => {
    const result = await signInWithPhone('+919876543210');

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      phone: '+919876543210',
    });
    expect(result.error).toBeNull();
  });

  it('returns error for phone number without + prefix', async () => {
    const result = await signInWithPhone('919876543210');

    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
    expect(result.error).not.toBeNull();
    expect(result.error?.message).toMatch(/E\.164/i);
  });

  it('returns error for phone number with spaces', async () => {
    const result = await signInWithPhone('+91 98765 43210');

    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
    expect(result.error).not.toBeNull();
  });

  it('returns error for empty phone number', async () => {
    const result = await signInWithPhone('');

    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
    expect(result.error).not.toBeNull();
  });

  it('returns error for phone number that is just +', async () => {
    const result = await signInWithPhone('+');

    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
    expect(result.error).not.toBeNull();
  });

  it('accepts international E.164 numbers', async () => {
    // US number
    const result = await signInWithPhone('+12125551234');

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      phone: '+12125551234',
    });
    expect(result.error).toBeNull();
  });

  it('passes through Supabase errors', async () => {
    const mockError = { message: 'SMS provider not configured' };
    (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const result = await signInWithPhone('+919876543210');

    expect(result.error).toEqual(mockError);
  });
});

describe('verifyPhoneOtp', () => {
  it('calls supabase.auth.verifyOtp with type sms', async () => {
    const result = await verifyPhoneOtp('+919876543210', '123456');

    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
      phone: '+919876543210',
      token: '123456',
      type: 'sms',
    });
    expect(result.error).toBeNull();
  });

  it('passes the correct phone and token to verifyOtp', async () => {
    await verifyPhoneOtp('+917654321098', '654321');

    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '+917654321098',
        token: '654321',
        type: 'sms',
      })
    );
  });

  it('passes through Supabase errors', async () => {
    const mockError = { message: 'Token has expired or is invalid' };
    (supabase.auth.verifyOtp as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const result = await verifyPhoneOtp('+919876543210', '000000');

    expect(result.error).toEqual(mockError);
  });
});
