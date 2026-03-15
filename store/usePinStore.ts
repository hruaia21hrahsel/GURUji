import { create } from 'zustand';

/**
 * usePinStore: PIN lock state management.
 *
 * No persist — PIN state is derived from SecureStore on app launch.
 * isLocked starts as true — only set to false after successful PIN/biometric entry.
 * failedAttempts stored in SecureStore (not AsyncStorage) to prevent bypass on rooted Android.
 */

interface PinState {
  isLocked: boolean;
  hasPin: boolean;
  failedAttempts: number;
  biometricEnabled: boolean;

  unlock: () => void;
  lock: () => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  setHasPin: (value: boolean) => void;
  setBiometricEnabled: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  isLocked: true,
  hasPin: false,
  failedAttempts: 0,
  biometricEnabled: false,
};

export const usePinStore = create<PinState>()((set) => ({
  ...initialState,

  unlock: () =>
    set({ isLocked: false, failedAttempts: 0 }),

  lock: () =>
    set({ isLocked: true }),

  incrementFailedAttempts: () =>
    set((state) => ({ failedAttempts: state.failedAttempts + 1 })),

  resetFailedAttempts: () =>
    set({ failedAttempts: 0 }),

  setHasPin: (value) =>
    set({ hasPin: value }),

  setBiometricEnabled: (value) =>
    set({ biometricEnabled: value }),

  reset: () => set(initialState),
}));
