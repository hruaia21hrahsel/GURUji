/**
 * Tests for email/password auth helpers.
 * AUTH-03: sign-up validates inputs; sign-in calls correct Supabase method.
 */

import { signUpWithEmail, signInWithEmail } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

describe('signUpWithEmail', () => {
  it('calls supabase.auth.signUp with email and password', async () => {
    const result = await signUpWithEmail('student@example.com', 'password123');

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'password123',
    });
    expect(result.error).toBeNull();
  });

  it('returns error for password shorter than 6 characters', async () => {
    const result = await signUpWithEmail('student@example.com', 'abc');

    expect(supabase.auth.signUp).not.toHaveBeenCalled();
    expect(result.error).not.toBeNull();
    expect(result.error?.message).toMatch(/6 characters/i);
  });

  it('returns error for invalid email format', async () => {
    const result = await signUpWithEmail('not-an-email', 'password123');

    expect(supabase.auth.signUp).not.toHaveBeenCalled();
    expect(result.error).not.toBeNull();
    expect(result.error?.message).toMatch(/valid email/i);
  });

  it('returns error for empty email', async () => {
    const result = await signUpWithEmail('', 'password123');

    expect(supabase.auth.signUp).not.toHaveBeenCalled();
    expect(result.error).not.toBeNull();
  });

  it('accepts password exactly 6 characters long', async () => {
    const result = await signUpWithEmail('student@example.com', '123456');

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: '123456',
    });
    expect(result.error).toBeNull();
  });
});

describe('signInWithEmail', () => {
  it('calls supabase.auth.signInWithPassword with email and password', async () => {
    const result = await signInWithEmail('student@example.com', 'password123');

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'password123',
    });
    expect(result.error).toBeNull();
  });

  it('passes through Supabase errors', async () => {
    const mockError = { message: 'Invalid login credentials' };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const result = await signInWithEmail('wrong@example.com', 'wrongpassword');

    expect(result.error).toEqual(mockError);
  });
});
