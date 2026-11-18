import type { AppState } from '../types';
import { dateKey } from '../lib/learning';

export const STORAGE_KEY = 'trophic-ecology-state-v1';
export const CURRENT_VERSION = 1;

export function defaultState(): AppState {
  const now = Date.now();
  return {
    version: CURRENT_VERSION,
    createdAt: now,
    lastActive: now,
    settings: { sound: true, theme: 'dark', reduceMotion: false, focusDefault: 50 },
    xp: 0,
    attempts: [],
    questionStats: {},
    flashcards: {},
    lessons: {},
    gameBests: {},
    exams: [],
    achievements: {},
    streak: { current: 0, longest: 0, lastDay: '' },
    studyDays: {},
    totalStudyMs: 0,
    sessions: [],
    dailyChallenge: { date: dateKey(), questionIds: [], completed: false, correct: 0, answeredIds: [] },
    seenIntro: false,
    baselineUsed: true,
    bestSessionStreak: 0,
    bestDailyQuestions: 0,
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export function sanitizeState(raw: unknown): AppState {
  const base = defaultState();
  if (!isObject(raw)) return base;
  const state: AppState = {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(isObject(raw.settings) ? raw.settings : {}) },
    streak: { ...base.streak, ...(isObject(raw.streak) ? raw.streak : {}) },
    dailyChallenge: { ...base.dailyChallenge, ...(isObject(raw.dailyChallenge) ? raw.dailyChallenge : {}) },
    attempts: Array.isArray(raw.attempts) ? (raw.attempts as AppState['attempts']) : [],
    exams: Array.isArray(raw.exams) ? (raw.exams as AppState['exams']) : [],
    sessions: Array.isArray(raw.sessions) ? (raw.sessions as AppState['sessions']) : [],
    questionStats: isObject(raw.questionStats) ? (raw.questionStats as AppState['questionStats']) : {},
    flashcards: isObject(raw.flashcards) ? (raw.flashcards as AppState['flashcards']) : {},
    lessons: isObject(raw.lessons) ? (raw.lessons as AppState['lessons']) : {},
    gameBests: isObject(raw.gameBests) ? (raw.gameBests as AppState['gameBests']) : {},
    achievements: isObject(raw.achievements) ? (raw.achievements as AppState['achievements']) : {},
    studyDays: isObject(raw.studyDays) ? (raw.studyDays as AppState['studyDays']) : {},
  };
  state.version = CURRENT_VERSION;
  if (!state.dailyChallenge.answeredIds) state.dailyChallenge.answeredIds = [];
  if (![1, 2, 3, 4, 5].includes(state.settings.focusDefault)) state.settings.focusDefault = 50;
  if (!['dark', 'light'].includes(state.settings.theme)) state.settings.theme = 'dark';
  state.attempts = state.attempts
    .filter((a) => a && typeof a.questionId === 'string' && typeof a.at === 'number')
    .slice(-4000);
  state.sessions = state.sessions.filter((s) => s && typeof s.startedAt === 'number').slice(-250);
  return state;
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState();
    return sanitizeState(JSON.parse(stored));
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastActive: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString(), app: 'TROPHIC' }, null, 2);
}

export function importState(text: string): { state?: AppState; error?: string } {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isObject(parsed)) return { error: 'The backup is not a valid JSON object.' };
    if (!('attempts' in parsed) && !('settings' in parsed)) {
      return { error: 'This does not look like a TROPHIC backup.' };
    }
    return { state: sanitizeState(parsed) };
  } catch {
    return { error: 'Could not read this file as JSON.' };
  }
}

export function downloadBackup(state: AppState) {
  const blob = new Blob([exportState(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trophic-backup-${dateKey()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}