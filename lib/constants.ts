import type { ClassLevel, Board, Language } from "./types";

export const CLASS_LEVELS: ClassLevel[] = [6, 7, 8, 9, 10, 11, 12];

export const BOARDS: { value: Board; label: string }[] = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "State", label: "State Board" },
];

export const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: "English", label: "English", native: "English" },
  { value: "Hindi", label: "Hindi", native: "हिन्दी" },
  { value: "Hinglish", label: "Hinglish", native: "Hinglish" },
];

export const SUBJECTS = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Hindi",
  "Physics",
  "Chemistry",
  "Biology",
] as const;
