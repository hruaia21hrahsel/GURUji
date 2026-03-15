import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
}

export const useChatStore = create<ChatState>()(
  persist(
    () => ({
      sessions: [],
      activeSessionId: null,
    }),
    {
      name: 'guruji-chat-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
