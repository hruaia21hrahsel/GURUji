/**
 * Tests for syncProfileToSupabase in lib/auth.ts
 */

import { syncProfileToSupabase } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

describe('syncProfileToSupabase', () => {
  beforeEach(() => {
    // Set up a complete app profile
    useAppStore.setState({
      class: '10',
      board: 'CBSE',
      language: 'English',
      isOnboarded: true,
      isAuthenticated: true,
      userId: 'test-user-id',
      authProvider: 'email',
    } as any);
  });

  it('calls supabase.from("profiles").upsert with the correct data', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    await syncProfileToSupabase('test-user-id');

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-user-id',
        class: '10',
        board: 'CBSE',
        language: 'English',
      }),
      expect.objectContaining({ onConflict: 'id' })
    );
  });

  it('includes updated_at timestamp in upsert payload', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    await syncProfileToSupabase('test-user-id');

    const callArgs = mockUpsert.mock.calls[0][0];
    expect(callArgs).toHaveProperty('updated_at');
    expect(typeof callArgs.updated_at).toBe('string');
  });

  it('handles Supabase error gracefully — logs but does not throw', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockUpsert = jest
      .fn()
      .mockResolvedValue({ error: { message: 'Database error' } });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    // Should not throw
    await expect(syncProfileToSupabase('test-user-id')).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('does not call upsert when profile fields are missing', async () => {
    // Clear the profile state
    useAppStore.setState({ class: undefined, board: undefined, language: undefined } as any);

    const mockUpsert = jest.fn();
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    await syncProfileToSupabase('test-user-id');

    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
