import type { StudentClass, Board, Language } from './types';

export const CLASS_OPTIONS: { label: string; value: StudentClass }[] = [
  { label: 'Class 6', value: '6' },
  { label: 'Class 7', value: '7' },
  { label: 'Class 8', value: '8' },
  { label: 'Class 9', value: '9' },
  { label: 'Class 10', value: '10' },
  { label: 'Class 11', value: '11' },
  { label: 'Class 12', value: '12' },
];

export const BOARD_OPTIONS: { label: string; value: Board }[] = [
  { label: 'CBSE', value: 'CBSE' },
  { label: 'ICSE', value: 'ICSE' },
  { label: 'State Board', value: 'State' },
];

export const LANGUAGE_OPTIONS: { label: string; value: Language }[] = [
  { label: 'English', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
];

export const PRIMARY_COLOR = '#6C47FF';
