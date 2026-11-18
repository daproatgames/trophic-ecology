import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Analytics,
  AppState,
  ExamResult,
  LessonProgress,
  Question,
  StudySession,
  TopicId,
} from '../types';
import { computeAnalytics, dailyChallengeFor, dateKey, levelForXp, updateQuestionStat, updateStreak, xpForAnswer } from '../lib/learning';
import { checkAchievements } from '../data/achievements';
import { defaultState, downloadBackup, importState, loadState, saveState } from '../lib/storage';
import { sound } from '../lib/sound';
import { QUESTION_MAP } from '../data/questions';

export interface Toast {
  id: string;
  kind: 'xp' | 'level' | 'achievement' | 'info' | 'error';
  title: string;
  description?: string;
  xp?: number;
  icon?: string;
}

interface RecordAnswerInput {
  question: Question;
  response: string | number | string[] | number[] | boolean | null;
  score: number; // 0..1
  mode: string;
  silent?: boolean;
}

interface RecordAnswerResult {
  xp: number;
  leveledUp: boolean;
  newLevel?: number;
  achievements: string[];
  correct: boolean;
}

interface StudyContextValue {
  state: AppState;
  analytics: Analytics;
  toasts: Toast[];
  celebration: number;
  sessionStreak: number;
  recordAnswer: (input: RecordAnswerInput) => RecordAnswerResult;
  recordGameResult: (
    gameId: string,
    score: number,
    accuracy: number,
    detail?: Record<string, number | string>,
    bonusXp?: number,
  ) => RecordAnswerResult;
  grantXp: (amount: number, reason: string, silent?: boolean) => void;
  markSectionRead: (lessonId: string, sectionId: string) => void;
  saveLessonQuiz: (lessonId: string, correct: number, total: number) => void;
  completeLesson: (lessonId: string) => void;
  markLessonFlag: (lessonId: string, flag: 'challengeDone' | 'simplerUsed' | 'teachBackDone') => void;
  saveExam: (exam: ExamResult) => void;
  updateExamSelfScore: (examId: string, questionId: string, score: number) => void;
  recordStudyTime: (ms: number) => void;
  recordSession: (session: StudySession) => void;
  rateFlashcard: (cardId: string, rating: 1 | 2 | 3 | 4, silent?: boolean) => void;
  setSettings: (settings: Partial<AppState['settings']>) => void;
  resetSessionStreak: () => void;
  resetAll: () => void;
  importBackup: (text: string) => { ok: boolean; error?: string };
  exportBackup: () => void;
  markIntroSeen: () => void;
  setBaselineUsed: (value: boolean) => void;
  ensureDailyChallenge: () => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  triggerCelebration: () => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function recalcExam(exam: ExamResult, answers: ExamResult['answers']): ExamResult {
  let earned = 0;
  let total = 0;
  const byTopic: ExamResult['byTopic'] = {};
  const bySection: ExamResult['bySection'] = { ...exam.bySection };
  Object.keys(bySection).forEach((k) => (bySection[k] = { earned: 0, total: 0 }));
  for (const ans of answers) {
    const q = QUESTION_MAP[ans.questionId];
    if (!q) continue;
    const points = ans.points ?? 1;
    const score = ans.score ?? 0;
    earned += score * points;
    total += points;
    if (!byTopic[q.topic]) byTopic[q.topic] = { earned: 0, total: 0 };
    byTopic[q.topic].earned += score * points;
    byTopic[q.topic].total += points;
    const section = ans.section ?? q.tags?.find((t) => t.startsWith('section:'))?.slice(8) ?? 'main';
    if (!bySection[section]) bySection[section] = { earned: 0, total: 0 };
    bySection[section].earned += score * points;
    bySection[section].total += points;
  }
  return { ...exam, answers, totalEarned: Math.round(earned * 10) / 10, totalPoints: total, byTopic, bySection };
}

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebration, setCelebration] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const stateRef = useRef(state);
  const sessionStreakRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  stateRef.current = state;

  const analytics = useMemo(() => computeAnalytics(state), [state]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uid();
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    const timer = window.setTimeout(() => dismissToast(id), toast.kind === 'achievement' ? 5200 : 3600);
    timersRef.current.push(timer);
  }, [dismissToast]);

  const triggerCelebration = useCallback(() => setCelebration((n) => n + 1), []);

  useEffect(() => {
    return () => timersRef.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // Persist (debounced) and on page hide.
  useEffect(() => {
    const timer = window.setTimeout(() => saveState(state), 250);
    return () => window.clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    const handler = () => saveState(stateRef.current);
    window.addEventListener('pagehide', handler);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveState(stateRef.current);
    });
    return () => window.removeEventListener('pagehide', handler);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    sound.setEnabled(state.settings.sound);
  }, [state.settings.theme, state.settings.sound]);

  useEffect(() => {
    const d = state.dailyChallenge;
    if (d.date !== dateKey() || d.questionIds.length === 0) {
      const ids = dailyChallengeFor(stateRef.current);
      setState((prev) => ({
        ...prev,
        dailyChallenge: {
          date: dateKey(),
          questionIds: ids,
          completed: false,
          correct: 0,
          answeredIds: [],
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAchievements = useCallback(
    (tentative: AppState): { state: AppState; unlocked: string[]; bonusXp: number } => {
      const a = computeAnalytics(tentative);
      const unlocked = checkAchievements(tentative, a);
      if (!unlocked.length) return { state: tentative, unlocked: [], bonusXp: 0 };
      const achievements = { ...tentative.achievements };
      let bonusXp = 0;
      unlocked.forEach((ach) => {
        achievements[ach.id] = Date.now();
        bonusXp += ach.xp;
      });
      const next = { ...tentative, achievements, xp: tentative.xp + bonusXp };
      return { state: next, unlocked: unlocked.map((x) => x.id), bonusXp };
    },
    [],
  );

  const announce = useCallback(
    (unlockedIds: string[], xp: number, oldXp: number, newXp: number, opts?: { silent?: boolean; reason?: string }) => {
      const oldLevel = levelForXp(oldXp);
      const newLevel = levelForXp(newXp);
      if (!opts?.silent && xp > 0) {
        pushToast({ kind: 'xp', title: `+${xp} XP`, description: opts?.reason ?? 'Evidence logged' });
      }
      if (newLevel.level > oldLevel.level) {
        sound.play('level');
        triggerCelebration();
        pushToast({
          kind: 'level',
          title: `Level ${newLevel.level} — ${newLevel.title}`,
          description: 'New rank unlocked. Keep the evidence coming.',
        });
      }
      for (const id of unlockedIds) {
        // Achievement metadata is read by the toast renderer.
        pushToast({ kind: 'achievement', title: id, description: 'Achievement unlocked', icon: 'award' });
      }
      return { leveledUp: newLevel.level > oldLevel.level, newLevel: newLevel.level };
    },
    [pushToast, triggerCelebration],
  );

  const recordAnswer = useCallback(
    (input: RecordAnswerInput): RecordAnswerResult => {
      const prev = stateRef.current;
      const score = Math.max(0, Math.min(1, input.score));
      const correct = score >= 0.7;
      const prior = prev.attempts.filter((a) => a.questionId === input.question.id);
      const priorCorrect = prior.filter((a) => a.correct >= 0.7).length;
      const xp = xpForAnswer(input.question, correct, prior.length, priorCorrect);
      const now = Date.now();
      const today = dateKey();
      const todayData = prev.studyDays[today] ?? { questions: 0, correct: 0, minutes: 0, xp: 0 };

      const attempts = [
        ...prev.attempts,
        {
          id: uid(),
          questionId: input.question.id,
          concepts: input.question.concepts,
          topic: input.question.topic,
          correct: score,
          type: input.question.type,
          difficulty: input.question.difficulty,
          mode: input.mode,
          response: Array.isArray(input.response) ? input.response.join(' | ') : String(input.response ?? ''),
          at: now,
          xp,
        },
      ].slice(-4000);

      const newSessionStreak = correct ? sessionStreakRef.current + 1 : 0;
      sessionStreakRef.current = newSessionStreak;
      setSessionStreak(newSessionStreak);

      let dailyChallenge = prev.dailyChallenge;
      let gameBests = prev.gameBests;
      if (
        dailyChallenge.date === today &&
        dailyChallenge.questionIds.includes(input.question.id) &&
        !dailyChallenge.answeredIds.includes(input.question.id)
      ) {
        const answeredIds = [...dailyChallenge.answeredIds, input.question.id];
        const correctCount = dailyChallenge.correct + (correct ? 1 : 0);
        const completed = answeredIds.length >= dailyChallenge.questionIds.length;
        dailyChallenge = { ...dailyChallenge, answeredIds, correct: correctCount, completed };
        if (completed && !prev.dailyChallenge.completed) {
          const doneCount = (prev.gameBests['daily-challenges']?.score ?? 0) + 1;
          gameBests = {
            ...prev.gameBests,
            'daily-challenges': { score: doneCount, accuracy: 100, at: now },
          };
        }
      }

      const tentative: AppState = {
        ...prev,
        gameBests,
        attempts,
        questionStats: {
          ...prev.questionStats,
          [input.question.id]: updateQuestionStat(
            prev.questionStats[input.question.id],
            correct,
            input.question.difficulty,
          ),
        },
        xp: prev.xp + xp,
        streak: updateStreak(prev),
        studyDays: {
          ...prev.studyDays,
          [today]: {
            questions: todayData.questions + 1,
            correct: todayData.correct + (correct ? 1 : 0),
            minutes: todayData.minutes,
            xp: todayData.xp + xp,
          },
        },
        dailyChallenge,
        bestSessionStreak: Math.max(prev.bestSessionStreak, newSessionStreak),
        bestDailyQuestions: Math.max(prev.bestDailyQuestions, todayData.questions + 1),
      };

      const { state: withAchievements, unlocked } = applyAchievements(tentative);
      const oldXp = prev.xp;
      setState(withAchievements);
      stateRef.current = withAchievements;
      if (correct) sound.play('correct');
      else sound.play('wrong');
      const ann = announce(unlocked, xp, oldXp, withAchievements.xp, {
        silent: input.silent,
        reason: correct ? `${input.question.type.toUpperCase()} · +${xp} XP` : 'Effort logged — review the explanation',
      });
      return { xp: withAchievements.xp - oldXp, correct, achievements: unlocked, ...ann };
    },
    [announce, applyAchievements],
  );

  const grantXp = useCallback(
    (amount: number, reason: string, silent = false) => {
      const prev = stateRef.current;
      const tentative = { ...prev, xp: prev.xp + amount };
      const { state: withAch, unlocked } = applyAchievements(tentative);
      setState(withAch);
      stateRef.current = withAch;
      announce(unlocked, amount, prev.xp, withAch.xp, { silent, reason });
    },
    [announce, applyAchievements],
  );

  const recordGameResult = useCallback(
    (gameId: string, score: number, accuracy: number, detail?: Record<string, number | string>, bonusXp = 0) => {
      const prev = stateRef.current;
      const existing = prev.gameBests[gameId];
      const best = !existing || score > existing.score ? { score, accuracy, at: Date.now(), detail } : existing;
      const tentative: AppState = {
        ...prev,
        xp: prev.xp + bonusXp,
        gameBests: { ...prev.gameBests, [gameId]: best },
        streak: updateStreak(prev),
      };
      const { state: withAch, unlocked } = applyAchievements(tentative);
      setState(withAch);
      stateRef.current = withAch;
      const ann = announce(unlocked, bonusXp, prev.xp, withAch.xp, {
        silent: bonusXp <= 0,
        reason: 'Session reward',
      });
      return { xp: withAch.xp - prev.xp, achievements: unlocked, correct: true, ...ann };
    },
    [announce, applyAchievements],
  );

  const markSectionRead = useCallback((lessonId: string, sectionId: string) => {
    const prev = stateRef.current;
    const lp: LessonProgress = prev.lessons[lessonId] ?? {
      sectionsRead: [],
      completed: false,
      quizAttempts: 0,
    };
    if (lp.sectionsRead.includes(sectionId)) return;
    const xp = 2;
    const tentative: AppState = {
      ...prev,
      xp: prev.xp + xp,
      lessons: { ...prev.lessons, [lessonId]: { ...lp, sectionsRead: [...lp.sectionsRead, sectionId] } },
      streak: updateStreak(prev),
    };
    const { state: withAch } = applyAchievements(tentative);
    setState(withAch);
    stateRef.current = withAch;
  }, [applyAchievements]);

  const saveLessonQuiz = useCallback((lessonId: string, correct: number, total: number) => {
    const prev = stateRef.current;
    const lp: LessonProgress = prev.lessons[lessonId] ?? {
      sectionsRead: [],
      completed: false,
      quizAttempts: 0,
    };
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const xp = 8 + correct * 4;
    const tentative: AppState = {
      ...prev,
      xp: prev.xp + xp,
      lessons: {
        ...prev.lessons,
        [lessonId]: {
          ...lp,
          quizAttempts: lp.quizAttempts + 1,
          quizBest: Math.max(lp.quizBest ?? 0, pct),
        },
      },
      streak: updateStreak(prev),
    };
    const { state: withAch, unlocked } = applyAchievements(tentative);
    setState(withAch);
    stateRef.current = withAch;
    announce(unlocked, xp, prev.xp, withAch.xp, {
      silent: false,
      reason: `Lesson quiz · ${correct}/${total}`,
    });
    sound.play(pct >= 60 ? 'correct' : 'wrong');
  }, [announce, applyAchievements]);

  const completeLesson = useCallback((lessonId: string) => {
    const prev = stateRef.current;
    const lp: LessonProgress = prev.lessons[lessonId] ?? {
      sectionsRead: [],
      completed: false,
      quizAttempts: 0,
    };
    if (lp.completed) return;
    const tentative: AppState = {
      ...prev,
      xp: prev.xp + 25,
      lessons: { ...prev.lessons, [lessonId]: { ...lp, completed: true, completedAt: Date.now() } },
      streak: updateStreak(prev),
    };
    const { state: withAch, unlocked } = applyAchievements(tentative);
    setState(withAch);
    stateRef.current = withAch;
    announce(unlocked, 25, prev.xp, withAch.xp, { reason: 'Lesson mastered' });
    triggerCelebration();
  }, [announce, applyAchievements, triggerCelebration]);

  const markLessonFlag = useCallback((lessonId: string, flag: 'challengeDone' | 'simplerUsed' | 'teachBackDone') => {
    const prev = stateRef.current;
    const lp: LessonProgress = prev.lessons[lessonId] ?? {
      sectionsRead: [],
      completed: false,
      quizAttempts: 0,
    };
    if (lp[flag]) return;
    const xp = flag === 'challengeDone' ? 15 : 5;
    const tentative: AppState = {
      ...prev,
      xp: prev.xp + xp,
      lessons: { ...prev.lessons, [lessonId]: { ...lp, [flag]: true } },
    };
    const { state: withAch } = applyAchievements(tentative);
    setState(withAch);
    stateRef.current = withAch;
    if (flag === 'challengeDone') announce([], xp, prev.xp, withAch.xp, { reason: 'Challenge complete' });
  }, [announce, applyAchievements]);

  const saveExam = useCallback((exam: ExamResult) => {
    const prev = stateRef.current;
    const pct = exam.totalPoints ? exam.totalEarned / exam.totalPoints : 0;
    const xp = Math.round(25 + pct * 75);
    const tentative: AppState = {
      ...prev,
      xp: prev.xp + xp,
      exams: [exam, ...prev.exams].slice(0, 100),
      streak: updateStreak(prev),
    };
    const { state: withAch, unlocked } = applyAchievements(tentative);
    setState(withAch);
    stateRef.current = withAch;
    announce(unlocked, xp, prev.xp, withAch.xp, {
      reason: `Mock exam · ${Math.round(pct * 100)}%`,
    });
    sound.play(pct >= 0.7 ? 'win' : 'lose');
    if (pct >= 0.7) triggerCelebration();
  }, [announce, applyAchievements, triggerCelebration]);

  const updateExamSelfScore = useCallback((examId: string, questionId: string, score: number) => {
    const prev = stateRef.current;
    setState({
      ...prev,
      exams: prev.exams.map((e) =>
        e.id === examId
          ? recalcExam(e, e.answers.map((a) => (a.questionId === questionId ? { ...a, score } : a)))
          : e,
      ),
    });
  }, []);

  const recordStudyTime = useCallback((ms: number) => {
    if (ms <= 0) return;
    const prev = stateRef.current;
    const today = dateKey();
    const d = prev.studyDays[today] ?? { questions: 0, correct: 0, minutes: 0, xp: 0 };
    setState({
      ...prev,
      totalStudyMs: prev.totalStudyMs + ms,
      studyDays: { ...prev.studyDays, [today]: { ...d, minutes: d.minutes + ms / 60000 } },
    });
  }, []);

  const recordSession = useCallback((session: StudySession) => {
    const prev = stateRef.current;
    const tentative: AppState = {
      ...prev,
      sessions: [session, ...prev.sessions].slice(0, 250),
      streak: updateStreak(prev),
      xp: prev.xp + Math.max(0, Math.round(session.effectiveMs / 60000) * 2),
    };
    const { state: withAch } = applyAchievements(tentative);
    setState(withAch);
    stateRef.current = withAch;
  }, [applyAchievements]);

  const rateFlashcard = useCallback((cardId: string, rating: 1 | 2 | 3 | 4, silent = false) => {
    const prev = stateRef.current;
    const existing = prev.flashcards[cardId] ?? {
      dueAt: 0, intervalDays: 0, ease: 2.3, reps: 0, lapses: 0, lastAt: 0, rating: 0, seen: 0,
    };
    const ease = rating === 1 ? Math.max(1.3, existing.ease - 0.2) : rating === 2 ? Math.max(1.3, existing.ease - 0.05) : rating === 4 ? Math.min(3, existing.ease + 0.1) : existing.ease;
    let intervalDays = existing.intervalDays;
    if (rating === 1) intervalDays = 0;
    else if (rating === 2) intervalDays = 1;
    else if (rating === 3) intervalDays = existing.reps === 0 ? 2 : Math.max(2, Math.round(existing.intervalDays * ease));
    else intervalDays = existing.reps === 0 ? 4 : Math.max(4, Math.round(existing.intervalDays * ease * 1.3));
    const dueAt = rating === 1 ? Date.now() + 10 * 60_000 : Date.now() + intervalDays * 86_400_000;
    const xp = rating === 1 ? 1 : rating;
    const tentative: AppState = {
      ...prev,
      xp: prev.xp + xp,
      streak: updateStreak(prev),
      flashcards: {
        ...prev.flashcards,
        [cardId]: {
          dueAt, intervalDays, ease, reps: rating === 1 ? 0 : existing.reps + 1,
          lapses: existing.lapses + (rating === 1 ? 1 : 0), lastAt: Date.now(), rating,
          seen: existing.seen + 1,
        },
      },
    };
    const { state: withAch, unlocked } = applyAchievements(tentative);
    setState(withAch);
    stateRef.current = withAch;
    announce(unlocked, xp, prev.xp, withAch.xp, { silent, reason: 'Flashcard review' });
  }, [announce, applyAchievements]);

  const setSettings = useCallback((settings: Partial<AppState['settings']>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }));
  }, []);

  const resetSessionStreak = useCallback(() => {
    sessionStreakRef.current = 0;
    setSessionStreak(0);
  }, []);

  const resetAll = useCallback(() => {
    const fresh = defaultState();
    setState(fresh);
    stateRef.current = fresh;
    pushToast({ kind: 'info', title: 'Progress reset', description: 'All local data has been cleared.' });
  }, [pushToast]);

  const importBackup = useCallback((text: string) => {
    const result = importState(text);
    if (result.state) {
      setState(result.state);
      stateRef.current = result.state;
      pushToast({ kind: 'info', title: 'Backup restored', description: 'Your progress has been imported.' });
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }, [pushToast]);

  const exportBackup = useCallback(() => downloadBackup(stateRef.current), []);

  const markIntroSeen = useCallback(() => setState((prev) => ({ ...prev, seenIntro: true })), []);
  const setBaselineUsed = useCallback((value: boolean) => setState((prev) => ({ ...prev, baselineUsed: value })), []);

  const ensureDailyChallenge = useCallback(() => {
    const prev = stateRef.current;
    if (prev.dailyChallenge.date === dateKey() && prev.dailyChallenge.questionIds.length) return;
    const ids = dailyChallengeFor(prev);
    setState({
      ...prev,
      dailyChallenge: { date: dateKey(), questionIds: ids, completed: false, correct: 0, answeredIds: [] },
    });
  }, []);

  const value: StudyContextValue = {
    state,
    analytics,
    toasts,
    celebration,
    sessionStreak,
    recordAnswer,
    recordGameResult,
    grantXp,
    markSectionRead,
    saveLessonQuiz,
    completeLesson,
    markLessonFlag,
    saveExam,
    updateExamSelfScore,
    recordStudyTime,
    recordSession,
    rateFlashcard,
    setSettings,
    resetSessionStreak,
    resetAll,
    importBackup,
    exportBackup,
    markIntroSeen,
    setBaselineUsed,
    ensureDailyChallenge,
    pushToast,
    dismissToast,
    triggerCelebration,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used inside StudyProvider');
  return ctx;
}

export function useTopicMastery(topic: TopicId): number {
  const { analytics } = useStudy();
  return analytics.topicMastery[topic] ?? 0;
}