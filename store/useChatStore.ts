import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatSession } from "@/lib/types";

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  createSession: (title?: string) => string;
  setActiveSession: (id: string | null) => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
  getActiveSession: () => ChatSession | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (title) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const session: ChatSession = {
          id,
          title: title || "New Chat",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          activeSessionId:
            state.activeSessionId === id ? null : state.activeSessionId,
        })),

      clearAllSessions: () => set({ sessions: [], activeSessionId: null }),

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId);
      },
    }),
    {
      name: "guruji-chat-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
