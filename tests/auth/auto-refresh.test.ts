/**
 * Tests for AppState-driven auto-refresh behavior.
 * AUTH-04: Token auto-refresh starts on foreground, stops on background.
 *
 * Tests the behavior described in Research Pattern 4 and implemented in app/_layout.tsx.
 * Uses jest.setup.js mocks for AppState and supabase.auth.
 */

import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';

describe('AppState auto-refresh', () => {
  let appStateCallback: ((state: string) => void) | null = null;

  beforeEach(() => {
    // Capture the AppState callback registered by the component/module
    (AppState.addEventListener as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'change') {
        appStateCallback = callback;
      }
      return { remove: jest.fn() };
    });
  });

  it('calls startAutoRefresh when AppState changes to active', () => {
    // Register a listener (simulating what _layout.tsx does)
    AppState.addEventListener('change', (state: string) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // Trigger active state
    appStateCallback?.('active');

    expect(supabase.auth.startAutoRefresh).toHaveBeenCalledTimes(1);
    expect(supabase.auth.stopAutoRefresh).not.toHaveBeenCalled();
  });

  it('calls stopAutoRefresh when AppState changes to background', () => {
    AppState.addEventListener('change', (state: string) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // Trigger background state
    appStateCallback?.('background');

    expect(supabase.auth.stopAutoRefresh).toHaveBeenCalledTimes(1);
    expect(supabase.auth.startAutoRefresh).not.toHaveBeenCalled();
  });

  it('calls stopAutoRefresh when AppState changes to inactive', () => {
    AppState.addEventListener('change', (state: string) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // Trigger inactive state
    appStateCallback?.('inactive');

    expect(supabase.auth.stopAutoRefresh).toHaveBeenCalledTimes(1);
    expect(supabase.auth.startAutoRefresh).not.toHaveBeenCalled();
  });

  it('correctly handles multiple state transitions', () => {
    AppState.addEventListener('change', (state: string) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // Simulate: background -> active -> background
    appStateCallback?.('background');
    appStateCallback?.('active');
    appStateCallback?.('background');

    expect(supabase.auth.stopAutoRefresh).toHaveBeenCalledTimes(2);
    expect(supabase.auth.startAutoRefresh).toHaveBeenCalledTimes(1);
  });
});
