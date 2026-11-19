export type TopicId =
  | 'foundations'
  | 'foodwebs'
  | 'pyramids'
  | 'energy'
  | 'cycles'
  | 'nitrogen'
  | 'integration';

export type QuestionType =
  | 'mcq'
  | 'multi'
  | 'truefalse'
  | 'fill'
  | 'short'
  | 'scenario'
  | 'error'
  | 'causeeffect'
  | 'compare'
  | 'teachback';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface BlankSpec {
  accepted: string[][];
  hint?: string;
  label?: string;
}

export interface RubricGroup {
  label: string;
  synonyms: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  topic: TopicId;
  concepts: string[];
  difficulty: Difficulty;
  prompt: string;
  context?: string;
  options?: string[];
  answer?: number | number[] | boolean;
  blanks?: BlankSpec[];
  rubric?: RubricGroup[];
  modelAnswer?: string;
  explanation: string;
  whyWrong?: Record<number, string>;
  hints?: string[];
  source: string;
  teacherStyle?: boolean;
  tags?: string[];
}

export interface Concept {
  id: string;
  topic: TopicId;
  name: string;
  short: string;
  weight: number;
  lessonId: string;
  practiceTest?: number[];
}

export interface Topic {
  id: TopicId;
  name: string;
  shortName: string;
  color: string;
  soft: string;
  icon: string;
  description: string;
}

export interface Attempt {
  id: string;
  questionId: string;
  concepts: string[];
  topic: TopicId;
  correct: number;
  type: QuestionType;
  difficulty: Difficulty;
  mode: string;
  response?: string;
  at: number;
  xp: number;
  baseline?: boolean;
}

export interface QuestionStat {
  attempts: number;
  correct: number;
  wrong: number;
  lastResult: 'correct' | 'wrong';
  lastAt: number;
  streak: number;
  ease: number;
  intervalDays: number;
  dueAt: number;
  reps: number;
  lapses: number;
}

export interface LessonProgress {
  sectionsRead: string[];
  completed: boolean;
  completedAt?: number;
  quizBest?: number;
  quizAttempts: number;
  challengeDone?: boolean;
  simplerUsed?: boolean;
  teachBackDone?: boolean;
}

export interface GameBest {
  score: number;
  accuracy: number;
  at: number;
  detail?: Record<string, number | string>;
}

export interface AiGrade {
  awarded: number;
  feedback: string;
  model?: string;
}

export interface ExamAnswer {
  questionId: string;
  response: string | number | string[] | number[] | boolean | null;
  flagged: boolean;
  score?: number;
  points?: number;
  section?: string;
  ai?: AiGrade;
}

export interface ExamResult {
  id: string;
  blueprintId: string;
  blueprintName: string;
  at: number;
  durationMs: number;
  answers: ExamAnswer[];
  totalEarned: number;
  totalPoints: number;
  byTopic: Record<string, { earned: number; total: number }>;
  bySection: Record<string, { earned: number; total: number }>;
  autoGraded: boolean;
  aiGraded?: boolean;
  aiModel?: string;
  aiError?: string;
}

export interface StudySession {
  id: string;
  mode: string;
  startedAt: number;
  endedAt: number;
  questions: number;
  correct: number;
  effectiveMs: number;
}

export interface DailyChallenge {
  date: string;
  questionIds: string[];
  completed: boolean;
  correct: number;
  answeredIds: string[];
}

export interface FlashcardStat {
  dueAt: number;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
  lastAt: number;
  rating: number;
  seen: number;
}

export interface AppState {
  version: number;
  createdAt: number;
  lastActive: number;
  settings: {
    sound: boolean;
    theme: 'dark' | 'light';
    reduceMotion: boolean;
    focusDefault: number;
  };
  xp: number;
  attempts: Attempt[];
  questionStats: Record<string, QuestionStat>;
  flashcards: Record<string, FlashcardStat>;
  lessons: Record<string, LessonProgress>;
  gameBests: Record<string, GameBest>;
  exams: ExamResult[];
  achievements: Record<string, number>;
  streak: { current: number; longest: number; lastDay: string };
  studyDays: Record<string, { questions: number; correct: number; minutes: number; xp: number }>;
  totalStudyMs: number;
  sessions: StudySession[];
  dailyChallenge: DailyChallenge;
  seenIntro: boolean;
  baselineUsed: boolean;
  bestSessionStreak: number;
  bestDailyQuestions: number;
}

export interface Analytics {
  conceptMastery: Record<string, number>;
  topicMastery: Record<TopicId, number>;
  topicCoverage: Record<TopicId, number>;
  overallMastery: number;
  readiness: number;
  readinessParts: {
    mastery: number;
    coverage: number;
    rigor: number;
    recent: number;
    penalty: number;
  };
  questionsAnswered: number;
  correctPct: number;
  distinctQuestions: number;
  hardCorrect: number;
  conceptsStarted: number;
  conceptsMastered: number;
  dueReviews: number;
  dueFlashcards: number;
  strongest: { id: string; mastery: number }[];
  weakest: { id: string; mastery: number }[];
  recentAccuracy: number;
  level: number;
  levelTitle: string;
  levelProgress: number;
  xpIntoLevel: number;
  xpForNext: number;
  nextLevelXp: number;
}