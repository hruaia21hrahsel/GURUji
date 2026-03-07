export type ClassLevel = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Board = "CBSE" | "ICSE" | "State";

export type Language = "English" | "Hindi" | "Hinglish";

export interface UserProfile {
  class: ClassLevel | null;
  board: Board | null;
  language: Language | null;
  onboardingComplete: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
