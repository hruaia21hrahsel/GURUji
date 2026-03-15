import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StudentClass, Board, Language, AuthProvider } from '@/lib/types';

interface AppState {
  // Profile (set during onboarding)
  class: StudentClass | null;
  board: Board | null;
  language: Language | null;

  // Onboarding
  isOnboarded: boolean;

  // Auth
  userId: string | null;
  isAuthenticated: boolean;
  authProvider: AuthProvider | null;

  // Actions
  setClass: (value: StudentClass) => void;
  setBoard: (value: Board) => void;
  setLanguage: (value: Language) => void;
  completeOnboarding: () => void;
  setAuth: (params: { userId: string; isAuthenticated: boolean; authProvider: AuthProvider }) => void;
  clearAuth: () => void;
  resetAll: () => void;
}

const initialState = {
  class: null,
  board: null,
  language: null,
  isOnboarded: false,
  userId: null,
  isAuthenticated: false,
  authProvider: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setClass: (value) => set({ class: value }),
      setBoard: (value) => set({ board: value }),
      setLanguage: (value) => set({ language: value }),

      completeOnboarding: () => set({ isOnboarded: true }),

      setAuth: ({ userId, isAuthenticated, authProvider }) =>
        set({ userId, isAuthenticated, authProvider }),

      clearAuth: () =>
        set({ userId: null, isAuthenticated: false, authProvider: null }),

      resetAll: () => set(initialState),
    }),
    {
      name: 'guruji-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
