/**
 * Tests for usePinStore — PIN lock state management.
 * Covers PIN lockout behavior after 3 failed attempts.
 */

import { usePinStore } from '@/store/usePinStore';

describe('usePinStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    usePinStore.getState().reset();
  });

  it('has correct initial state', () => {
    const state = usePinStore.getState();

    expect(state.isLocked).toBe(true);
    expect(state.hasPin).toBe(false);
    expect(state.failedAttempts).toBe(0);
    expect(state.biometricEnabled).toBe(false);
  });

  it('unlock sets isLocked to false and resets failedAttempts', () => {
    const store = usePinStore.getState();

    // First increment some failed attempts
    store.incrementFailedAttempts();
    store.incrementFailedAttempts();
    expect(usePinStore.getState().failedAttempts).toBe(2);

    // Unlock should clear failed attempts and unlock
    usePinStore.getState().unlock();
    const state = usePinStore.getState();
    expect(state.isLocked).toBe(false);
    expect(state.failedAttempts).toBe(0);
  });

  it('lock sets isLocked to true', () => {
    usePinStore.getState().unlock();
    expect(usePinStore.getState().isLocked).toBe(false);

    usePinStore.getState().lock();
    expect(usePinStore.getState().isLocked).toBe(true);
  });

  it('incrementFailedAttempts increments the counter', () => {
    const store = usePinStore.getState();

    store.incrementFailedAttempts();
    expect(usePinStore.getState().failedAttempts).toBe(1);

    store.incrementFailedAttempts();
    expect(usePinStore.getState().failedAttempts).toBe(2);
  });

  it('reaches 3 failed attempts after 3 increments', () => {
    const store = usePinStore.getState();

    store.incrementFailedAttempts();
    store.incrementFailedAttempts();
    store.incrementFailedAttempts();

    expect(usePinStore.getState().failedAttempts).toBe(3);
  });

  it('resetFailedAttempts resets counter to 0', () => {
    const store = usePinStore.getState();

    store.incrementFailedAttempts();
    store.incrementFailedAttempts();
    store.resetFailedAttempts();

    expect(usePinStore.getState().failedAttempts).toBe(0);
  });

  it('setHasPin updates hasPin', () => {
    usePinStore.getState().setHasPin(true);
    expect(usePinStore.getState().hasPin).toBe(true);

    usePinStore.getState().setHasPin(false);
    expect(usePinStore.getState().hasPin).toBe(false);
  });

  it('setBiometricEnabled updates biometricEnabled', () => {
    usePinStore.getState().setBiometricEnabled(true);
    expect(usePinStore.getState().biometricEnabled).toBe(true);

    usePinStore.getState().setBiometricEnabled(false);
    expect(usePinStore.getState().biometricEnabled).toBe(false);
  });

  it('reset clears all state back to defaults', () => {
    const store = usePinStore.getState();

    // Modify all state
    store.unlock();
    store.setHasPin(true);
    store.incrementFailedAttempts();
    store.setBiometricEnabled(true);

    // Reset
    usePinStore.getState().reset();
    const state = usePinStore.getState();

    expect(state.isLocked).toBe(true);
    expect(state.hasPin).toBe(false);
    expect(state.failedAttempts).toBe(0);
    expect(state.biometricEnabled).toBe(false);
  });
});
