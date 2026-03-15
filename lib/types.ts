export type StudentClass = '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type Board = 'CBSE' | 'ICSE' | 'State';

export type Language = 'English' | 'Hindi';

export type AuthProvider = 'phone' | 'google' | 'email';

export interface Profile {
  class: StudentClass;
  board: Board;
  language: Language;
}
