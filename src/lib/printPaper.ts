import type { AppState, Question } from '../types';
import { selectQuestions } from './learning';

export interface MatchingItem {
  label: string;
  answers: number[];
}

export interface MatchingSet {
  processes: string[];
  items: MatchingItem[];
}

export interface PrintPaper {
  title: string;
  form: string;
  mcq: Question[];
  matching: MatchingSet;
  tf: Question[];
  written: Question[];
  writtenPoints: number[];
  totalPoints: number;
}

const MATCHING_VARIANTS: MatchingSet[] = [
  {
    processes: ['photosynthesis', 'cellular respiration', 'nitrification', 'denitrification', 'nitrogen fixation', 'combustion'],
    items: [
      { label: 'Algae', answers: [0, 1] },
      { label: 'Fish', answers: [1] },
      { label: 'Soil bacteria', answers: [1, 2, 3, 4] },
      { label: 'Lightning', answers: [4] },
      { label: 'Factories', answers: [5] },
    ],
  },
  {
    processes: ['photosynthesis', 'cellular respiration', 'ammonification', 'nitrification', 'nitrogen fixation', 'combustion'],
    items: [
      { label: 'Compost fungi', answers: [1, 2] },
      { label: 'Grass', answers: [0, 1] },
      { label: 'Cattle', answers: [1] },
      { label: 'Lightning', answers: [4] },
      { label: 'Vehicles', answers: [5] },
    ],
  },
  {
    processes: ['photosynthesis', 'cellular respiration', 'nitrogen fixation', 'nitrification', 'denitrification', 'combustion'],
    items: [
      { label: 'Duckweed', answers: [0, 1] },
      { label: 'Snail', answers: [1] },
      { label: 'Bacteria in waterlogged soil', answers: [1, 4] },
      { label: 'Lightning', answers: [2] },
      { label: 'Power plant', answers: [5] },
    ],
  },
  {
    processes: ['photosynthesis', 'cellular respiration', 'ammonification', 'nitrification', 'denitrification', 'combustion'],
    items: [
      { label: 'Moss', answers: [0, 1] },
      { label: 'Guppies', answers: [1] },
      { label: 'Decomposers in pond mud', answers: [1, 2, 4] },
      { label: 'Lightning', answers: [3] },
      { label: 'Industry', answers: [5] },
    ],
  },
];

function pick(
  state: AppState,
  count: number,
  types: Question['type'][],
  exclude: string[],
  teacherStyle?: boolean,
): Question[] {
  const picked = selectQuestions(state, { count, types, excludeIds: exclude, teacherStyle, avoidRecent: true });
  if (picked.length >= count) return picked;
  const more = selectQuestions(state, {
    count: count - picked.length,
    types,
    excludeIds: [...exclude, ...picked.map((q) => q.id)],
    avoidRecent: true,
  });
  return [...picked, ...more];
}

export function buildPrintPaper(state: AppState, excludeIds: string[] = []): PrintPaper {
  const used = new Set(excludeIds);
  const mcq = pick(state, 15, ['mcq'], [...used], true);
  mcq.forEach((q) => used.add(q.id));
  const tf = pick(state, 5, ['truefalse'], [...used]);
  tf.forEach((q) => used.add(q.id));
  const written = pick(state, 8, ['short', 'scenario', 'error', 'causeeffect', 'compare'], [...used]);
  const variant = Math.floor(Math.random() * MATCHING_VARIANTS.length);
  return {
    title: 'Biology Test – Practice Test',
    form: String.fromCharCode(65 + variant),
    mcq,
    matching: MATCHING_VARIANTS[variant],
    tf,
    written,
    writtenPoints: [3, 3, 3, 3, 3, 3, 3, 4],
    totalPoints: 50,
  };
}

export function matchingAnswerKey(matching: MatchingSet) {
  return matching.items.map((item) => item.answers.map((index) => String.fromCharCode(97 + index)).join(''));
}