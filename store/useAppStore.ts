import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ClassLevel, Board, Language } from "@/lib/types";

interface AppState {
  class: ClassLevel | null;
  board: Board | null;
  language: Language | null;
  onboardingComplete: boolean;
  setClass: (c: ClassLevel) => void;
  setBoard: (b: Board) => void;
  setLanguage: (l: Language) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      class: null,
      board: null,
      language: null,
      onboardingComplete: false,
      setClass: (c) => set({ class: c }),
      setBoard: (b) => set({ board: b }),
      setLanguage: (l) => set({ language: l, onboardingComplete: true }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () =>
        set({
          class: null,
          board: null,
          language: null,
          onboardingComplete: false,
        }),
    }),
    {
      name: "guruji-app-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
