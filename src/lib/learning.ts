import type {
  Analytics,
  AppState,
  Attempt,
  Difficulty,
  Question,
  QuestionStat,
  TopicId,
} from '../types';
import { CONCEPTS, CONCEPT_MAP, CONCEPTS_BY_TOPIC, TOPICS } from '../data/concepts';
import { QUESTIONS } from '../data/questions';

export const MASTERY_LABEL = (m: number) =>
  m >= 85 ? 'Mastered' : m >= 70 ? 'Strong' : m >= 50 ? 'Developing' : m >= 25 ? 'Learning' : 'Not started';

export const LEVELS = [
  { level: 1, xp: 0, title: 'Curious Cadet' },
  { level: 2, xp: 150, title: 'Field Observer' },
  { level: 3, xp: 400, title: 'Ecosystem Explorer' },
  { level: 4, xp: 800, title: 'Trophic Tactician' },
  { level: 5, xp: 1400, title: 'Cycle Sleuth' },
  { level: 6, xp: 2200, title: 'Biome Boss' },
  { level: 7, xp: 3200, title: 'Nitrogen Knight' },
  { level: 8, xp: 4500, title: 'Apex Scholar' },
  { level: 9, xp: 6200, title: 'Ecology Legend' },
  { level: 10, xp: 8200, title: 'Gauntlet Champion' },
];

export function levelForXp(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? { level: LEVELS[i].level + 1, xp: LEVELS[i].xp + 2000, title: 'Science Legend' };
    }
  }
  const xpIntoLevel = xp - current.xp;
  const xpForNext = Math.max(1, next.xp - current.xp);
  return {
    level: current.level,
    title: current.title,
    xpIntoLevel,
    xpForNext,
    nextLevelXp: next.xp,
    progress: Math.min(1, xpIntoLevel / xpForNext),
  };
}

export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  1: 0.7,
  2: 0.95,
  3: 1.2,
  4: 1.5,
  5: 1.8,
};

const TYPE_WEIGHT: Record<string, number> = {
  mcq: 0.85,
  truefalse: 0.7,
  multi: 1.0,
  fill: 1.15,
  short: 1.35,
  scenario: 1.4,
  error: 1.35,
  causeeffect: 1.35,
  compare: 1.4,
  teachback: 1.45,
};

// Low-confidence starting estimate from the marked practice-test coverage.
// It is deliberately capped and quickly outweighed by real attempts.
const BASELINE: Record<string, number> = {
  'ecosystem-definition': 30,
  'biotic-abiotic': 30,
  'ecological-organization': 30,
  'sustainability': 26,
  'keystone-species': 22,
  'food-chain': 30,
  'trophic-levels': 30,
  'energy-loss': 28,
  'energy-pyramid': 30,
  'biomass-pyramid': 28,
  'numbers-pyramid': 24,
  'solar-energy': 26,
  'photosynthesis': 30,
  'cellular-respiration': 28,
  'photo-respiration-link': 26,
  'feeding-roles': 24,
  'matter-energy': 26,
  'water-cycle': 28,
  'carbon-cycle': 30,
  'carbon-reservoirs': 22,
  'human-carbon-impact': 24,
  'nitrogen-importance': 26,
  'nitrogen-fixation': 18,
  'nitrification-assimilation': 20,
  'ammonification': 20,
  'denitrification': 18,
  'fertilizers-eutrophication': 24,
  'cycle-integration': 24,
  'data-calculation': 26,
  'exam-precision': 16,
};

function baselineScore(conceptId: string): number {
  return BASELINE[conceptId] ?? 20;
}

interface QuestionEvidence {
  question: Question;
  score: number;
  correct: boolean;
  attemptsForQuestion: number;
  lastAt: number;
}

type LatestMap = Map<string, { latest: Attempt; count: number }>;

const QUESTIONS_BY_CONCEPT: Record<string, Question[]> = (() => {
  const map: Record<string, Question[]> = {};
  for (const c of CONCEPTS) map[c.id] = [];
  for (const q of QUESTIONS) {
    for (const c of q.concepts) {
      if (!map[c]) map[c] = [];
      map[c].push(q);
    }
  }
  return map;
})();

function buildLatestMap(state: AppState): LatestMap {
  const map: LatestMap = new Map();
  for (const a of state.attempts) {
    const item = map.get(a.questionId);
    if (!item) map.set(a.questionId, { latest: a, count: 1 });
    else map.set(a.questionId, { latest: a, count: item.count + 1 });
  }
  return map;
}

function evidenceWithMap(conceptId: string, map: LatestMap): QuestionEvidence[] {
  const qs = QUESTIONS_BY_CONCEPT[conceptId] ?? [];
  const out: QuestionEvidence[] = [];
  for (const question of qs) {
    const item = map.get(question.id);
    if (!item) continue;
    out.push({
      question,
      score: Math.max(0, Math.min(1, item.latest.correct)),
      correct: item.latest.correct >= 0.7,
      attemptsForQuestion: item.count,
      lastAt: item.latest.at,
    });
  }
  return out;
}

function masteryFromEvidence(state: AppState, conceptId: string, evidence: QuestionEvidence[]): number {
  const now = Date.now();
  let weighted = 0;
  let weightTotal = 0;
  const prior = state.baselineUsed ? baselineScore(conceptId) : 0;
  if (prior > 0) {
    weighted += (prior / 100) * 0.9;
    weightTotal += 0.9;
  }
  for (const e of evidence) {
    const ageDays = Math.max(0, (now - e.lastAt) / 86_400_000);
    const recency = Math.max(0.5, Math.pow(0.5, ageDays / 120));
    const repeatPenalty = 1 / (1 + 0.3 * Math.max(0, e.attemptsForQuestion - 1));
    const w =
      DIFFICULTY_WEIGHT[e.question.difficulty] *
      (TYPE_WEIGHT[e.question.type] ?? 1) *
      repeatPenalty *
      recency *
      (e.question.teacherStyle ? 1.08 : 1);
    weighted += e.score * w;
    weightTotal += w;
  }
  const raw = weightTotal > 0 ? (weighted / weightTotal) * 100 : 0;

  const distinct = evidence.length;
  const hardCorrect = evidence.filter((e) => e.correct && e.question.difficulty >= 3).length;
  const types = new Set(evidence.map((e) => e.question.type)).size;
  const maxDiff = evidence.reduce((m, e) => Math.max(m, e.question.difficulty), 0);

  let cap = 100;
  if (distinct === 0) cap = prior > 0 ? 40 : 0;
  else if (distinct === 1) cap = 45;
  else if (distinct === 2) cap = 60;
  else if (distinct === 3) cap = 72;
  else if (distinct === 4) cap = 82;
  else if (distinct === 5) cap = 90;
  else if (distinct === 6) cap = 96;

  if (evidence.length > 0) {
    if (hardCorrect === 0) cap = Math.min(cap, 65);
    else if (hardCorrect === 1) cap = Math.min(cap, 80);
    else if (hardCorrect === 2) cap = Math.min(cap, 90);
  }
  if (evidence.length > 0) {
    if (types === 1) cap = Math.min(cap, 75);
    else if (types === 2) cap = Math.min(cap, 88);
  }
  if (evidence.length > 0) {
    if (maxDiff <= 1) cap = Math.min(cap, 65);
    else if (maxDiff === 2) cap = Math.min(cap, 80);
    else if (maxDiff === 3) cap = Math.min(cap, 92);
  }
  return Math.round(Math.max(0, Math.min(raw, cap)));
}

export function allConceptMastery(state: AppState): Record<string, number> {
  const map = buildLatestMap(state);
  const result: Record<string, number> = {};
  for (const c of CONCEPTS) result[c.id] = masteryFromEvidence(state, c.id, evidenceWithMap(c.id, map));
  return result;
}

export function conceptMastery(state: AppState, conceptId: string): number {
  const map = buildLatestMap(state);
  return masteryFromEvidence(state, conceptId, evidenceWithMap(conceptId, map));
}

export function computeAnalytics(state: AppState): Analytics {
  const latest = buildLatestMap(state);
  const conceptMasteryMap: Record<string, number> = {};
  const evidenceCounts: Record<string, number> = {};
  for (const c of CONCEPTS) {
    const ev = evidenceWithMap(c.id, latest);
    evidenceCounts[c.id] = ev.length;
    conceptMasteryMap[c.id] = masteryFromEvidence(state, c.id, ev);
  }

  const topicMastery = {} as Record<TopicId, number>;
  const topicCoverage = {} as Record<TopicId, number>;
  for (const t of TOPICS) {
    const concepts = CONCEPTS_BY_TOPIC[t.id];
    const totalWeight = concepts.reduce((s, c) => s + c.weight, 0);
    const mastery = concepts.reduce((s, c) => s + conceptMasteryMap[c.id] * c.weight, 0) / totalWeight;
    topicMastery[t.id] = Math.round(mastery);
    const covered = concepts.filter((c) => evidenceCounts[c.id] > 0).length;
    topicCoverage[t.id] = Math.round((covered / concepts.length) * 100);
  }

  const totalWeight = CONCEPTS.reduce((s, c) => s + c.weight, 0);
  const overallMastery = Math.round(
    CONCEPTS.reduce((s, c) => s + conceptMasteryMap[c.id] * c.weight, 0) / totalWeight,
  );

  const attempts = state.attempts;
  const questionsAnswered = attempts.length;
  const correctPct = questionsAnswered
    ? Math.round((attempts.filter((a) => a.correct >= 0.7).length / questionsAnswered) * 100)
    : 0;
  const distinctQuestions = new Set(attempts.map((a) => a.questionId)).size;
  const hardCorrect = attempts.filter((a) => a.correct >= 0.7 && a.difficulty >= 4).length;
  const conceptsStarted = CONCEPTS.filter((c) => evidenceCounts[c.id] > 0).length;
  const conceptsMastered = Object.values(conceptMasteryMap).filter((m) => m >= 80).length;
  const dueReviews = Object.values(state.questionStats).filter(
    (s) => s.attempts > 0 && s.dueAt > 0 && s.dueAt <= Date.now(),
  ).length;
  const dueFlashcards = Object.values(state.flashcards).filter(
    (s) => s.reps >= 0 && s.dueAt <= Date.now(),
  ).length;

  const sorted = CONCEPTS.map((c) => ({ id: c.id, mastery: conceptMasteryMap[c.id] })).sort(
    (a, b) => b.mastery - a.mastery,
  );
  const strongest = sorted.filter((c) => c.mastery > 0).slice(0, 4);
  const weakest = [...sorted].sort((a, b) => a.mastery - b.mastery).slice(0, 5);

  const recent = attempts.slice(-30);
  const recentAccuracy = recent.length
    ? Math.round((recent.filter((a) => a.correct >= 0.7).length / recent.length) * 100)
    : 0;

  const coverage = Math.min(100, (distinctQuestions / 60) * 100);
  const correctEvidence = attempts.filter((a) => a.correct >= 0.7);
  const rigor = correctEvidence.length
    ? Math.min(100, (correctEvidence.reduce((s, a) => s + a.difficulty, 0) / correctEvidence.length / 5) * 100 * 1.15)
    : 0;

  const struggleConcepts = CONCEPTS.filter((c) => {
    const ev = evidenceWithMap(c.id, latest);
    return ev.some((e) => !e.correct && e.question.difficulty >= 2) && conceptMasteryMap[c.id] < 50;
  }).length;
  const repeatedWrong = Object.entries(state.questionStats).filter(([, s]) => s.wrong >= 2).length;
  const penalty = Math.min(10, struggleConcepts * 1.2 + repeatedWrong * 0.35);

  let readiness =
    overallMastery * 0.5 + coverage * 0.15 + rigor * 0.15 + recentAccuracy * 0.2 - penalty;
  readiness = Math.max(0, Math.min(100, Math.round(readiness)));

  const lvl = levelForXp(state.xp);

  return {
    conceptMastery: conceptMasteryMap,
    topicMastery,
    topicCoverage,
    overallMastery,
    readiness,
    readinessParts: {
      mastery: Math.round(overallMastery),
      coverage: Math.round(coverage),
      rigor: Math.round(rigor),
      recent: recentAccuracy,
      penalty: Math.round(penalty),
    },
    questionsAnswered,
    correctPct,
    distinctQuestions,
    hardCorrect,
    conceptsStarted,
    conceptsMastered,
    dueReviews,
    dueFlashcards,
    strongest,
    weakest,
    recentAccuracy,
    level: lvl.level,
    levelTitle: lvl.title,
    levelProgress: Math.round(lvl.progress * 100),
    xpIntoLevel: lvl.xpIntoLevel,
    xpForNext: lvl.xpForNext,
    nextLevelXp: lvl.nextLevelXp,
  };
}

export function updateQuestionStat(
  existing: QuestionStat | undefined,
  correct: boolean,
  difficulty: Difficulty,
): QuestionStat {
  const now = Date.now();
  const stat: QuestionStat = existing ?? {
    attempts: 0,
    correct: 0,
    wrong: 0,
    lastResult: 'wrong',
    lastAt: 0,
    streak: 0,
    ease: 2.3,
    intervalDays: 0,
    dueAt: 0,
    reps: 0,
    lapses: 0,
  };
  const next = { ...stat, attempts: stat.attempts + 1, lastAt: now, lastResult: correct ? ('correct' as const) : ('wrong' as const) };
  if (correct) {
    next.correct += 1;
    next.streak += 1;
    next.reps += 1;
    if (next.reps === 1) next.intervalDays = 1;
    else if (next.reps === 2) next.intervalDays = 3;
    else if (next.reps === 3) next.intervalDays = 7;
    else if (next.reps === 4) next.intervalDays = 16;
    else next.intervalDays = Math.round(Math.max(1, next.intervalDays * next.ease));
    next.ease = Math.min(2.9, next.ease + (difficulty >= 4 ? 0.09 : 0.04));
    next.dueAt = now + next.intervalDays * 86_400_000;
  } else {
    next.wrong += 1;
    next.streak = 0;
    next.reps = 0;
    next.lapses += 1;
    next.intervalDays = 0;
    next.ease = Math.max(1.3, next.ease - 0.2);
    next.dueAt = now + 30 * 60 * 1000;
  }
  return next;
}

export function xpForAnswer(question: Question, correct: boolean, priorAttempts: number, priorCorrect: number): number {
  if (!correct) return 2;
  const base = { 1: 8, 2: 12, 3: 18, 4: 26, 5: 34 }[question.difficulty];
  const firstBonus = priorAttempts === 0 ? 6 : priorAttempts === 1 && priorCorrect === 0 ? 5 : 0;
  const repeatFactor = priorCorrect >= 2 ? 0.3 : priorCorrect === 1 ? 0.65 : 1;
  return Math.max(2, Math.round((base + firstBonus) * repeatFactor));
}

export function dateKey(ts = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function updateStreak(state: AppState): AppState['streak'] {
  const today = dateKey();
  const last = state.streak.lastDay;
  if (last === today) return state.streak;
  const yesterday = dateKey(Date.now() - 86_400_000);
  const current = last === yesterday ? state.streak.current + 1 : 1;
  return { current, longest: Math.max(state.streak.longest, current), lastDay: today };
}

export function dueLabel(dueAt: number): string {
  if (!dueAt) return 'New';
  const diff = dueAt - Date.now();
  if (diff <= 0) return 'Due now';
  const hours = Math.ceil(diff / 3_600_000);
  if (hours < 24) return `Due in ${hours}h`;
  const days = Math.ceil(hours / 24);
  return `Due in ${days}d`;
}

export interface SelectionOptions {
  count: number;
  types?: Question['type'][];
  topics?: TopicId[];
  minDifficulty?: number;
  maxDifficulty?: number;
  excludeIds?: string[];
  prioritizeConcepts?: string[];
  dueFirst?: boolean;
  teacherStyle?: boolean;
  avoidRecent?: boolean;
}

export function selectQuestions(state: AppState, opts: SelectionOptions): Question[] {
  const {
    count,
    types,
    topics,
    minDifficulty = 1,
    maxDifficulty = 5,
    excludeIds = [],
    prioritizeConcepts = [],
    dueFirst = true,
    teacherStyle,
    avoidRecent = true,
  } = opts;

  const recentIds = new Set(state.attempts.slice(-35).map((a) => a.questionId));
  const excluded = new Set(excludeIds);
  let pool = QUESTIONS.filter(
    (q) =>
      (!types || types.includes(q.type)) &&
      (!topics || topics.includes(q.topic)) &&
      q.difficulty >= minDifficulty &&
      q.difficulty <= maxDifficulty &&
      !excluded.has(q.id) &&
      (teacherStyle === undefined || !!q.teacherStyle === teacherStyle),
  );
  if (!pool.length) {
    pool = QUESTIONS.filter(
      (q) =>
        (!types || types.includes(q.type)) &&
        (!topics || topics.includes(q.topic)) &&
        q.difficulty >= minDifficulty &&
        q.difficulty <= maxDifficulty &&
        !excluded.has(q.id),
    );
  }
  if (!pool.length) pool = QUESTIONS.filter((q) => !excluded.has(q.id));

  const now = Date.now();
  const masteryMap = allConceptMastery(state);
  const scored = pool.map((q) => {
    const mastery =
      q.concepts.reduce((s, c) => s + (masteryMap[c] ?? 0), 0) / Math.max(1, q.concepts.length);
    let weight = 1 + ((100 - mastery) / 100) * 3.2;
    const stats = state.questionStats[q.id];
    if (stats?.dueAt && stats.dueAt <= now && dueFirst) weight += 3.5;
    if (!stats) weight += 1.3;
    if (prioritizeConcepts.some((c) => q.concepts.includes(c))) weight += 2.6;
    if (avoidRecent && recentIds.has(q.id)) weight *= 0.12;
    if (stats?.wrong && stats.wrong > 0) weight += Math.min(2, stats.wrong * 0.5);
    if (q.teacherStyle) weight += 0.5;
    // Prefer questions slightly above current mastery, but never exclusively hardest.
    const targetDiff = mastery >= 80 ? 4.5 : mastery >= 55 ? 3.6 : mastery >= 30 ? 2.8 : 2;
    weight *= 1 / (1 + Math.abs(q.difficulty - targetDiff) * 0.22);
    return { q, weight: Math.max(0.05, weight), r: Math.random() };
  });

  const chosen: Question[] = [];
  const remaining = [...scored];
  while (chosen.length < count && remaining.length) {
    const total = remaining.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < remaining.length; idx++) {
      r -= remaining[idx].weight;
      if (r <= 0) break;
    }
    idx = Math.min(idx, remaining.length - 1);
    chosen.push(remaining[idx].q);
    remaining.splice(idx, 1);
  }

  // Interleave topics: avoid three of the same topic in a row.
  const interleaved: Question[] = [];
  const pending = [...chosen];
  while (pending.length) {
    let idx = 0;
    if (interleaved.length >= 2) {
      const last = interleaved[interleaved.length - 1].topic;
      if (interleaved[interleaved.length - 2].topic === last) {
        const alt = pending.findIndex((q) => q.topic !== last);
        if (alt >= 0) idx = alt;
      }
    }
    interleaved.push(pending.splice(idx, 1)[0]);
  }
  return interleaved;
}

export function buildReviewQueue(state: AppState, count = 12): Question[] {
  const now = Date.now();
  const due = QUESTIONS.filter((q) => {
    const s = state.questionStats[q.id];
    return s && s.attempts > 0 && s.dueAt <= now;
  });
  const masteryMap = allConceptMastery(state);
  const weak = [...new Set(CONCEPTS.filter((c) => (masteryMap[c.id] ?? 0) < 55).map((c) => c.id))];
  const chosenDue = due.slice(0, Math.ceil(count * 0.55));
  const dueIds = new Set(chosenDue.map((q) => q.id));
  const weakQs = selectQuestions(state, {
    count: count - chosenDue.length,
    excludeIds: [...dueIds],
    prioritizeConcepts: weak,
  });
  return [...chosenDue, ...weakQs].slice(0, count);
}

export function recommendations(_state: AppState, analytics: Analytics) {
  const weakest = analytics.weakest[0];
  const due = analytics.dueReviews;
  if (analytics.questionsAnswered < 8) {
    return {
      title: 'Run a 10-question calibration',
      description: 'Your dashboard needs evidence. A short adaptive drill will map your strengths and set your starting difficulty.',
      cta: 'Start calibration',
      to: '/practice?mode=diagnostic',
      type: 'drill',
      concept: weakest?.id,
    };
  }
  if (due >= 5) {
    return {
      title: `Clear ${due} due reviews`,
      description: 'Spaced repetition is most effective when reviews happen close to their due time. These are ready now.',
      cta: 'Open smart review',
      to: '/practice?mode=review',
      type: 'review',
      concept: weakest?.id,
    };
  }
  if (weakest && weakest.mastery < 55) {
    const concept = CONCEPT_MAP[weakest.id];
    return {
      title: `Target: ${concept.name}`,
      description: `This is your weakest concept right now (${weakest.mastery}% mastery). A short lesson + retrieval set is the fastest way to raise it.`,
      cta: 'Fix this weakness',
      to: `/learn/${concept.lessonId}?concept=${concept.id}`,
      type: 'lesson',
      concept: weakest.id,
    };
  }
  if (analytics.readiness < 75) {
    return {
      title: 'Mixed practice to raise readiness',
      description: 'Interleave topics and attempt harder application questions. Coverage and rigor are the fastest gains now.',
      cta: 'Start mixed drill',
      to: '/practice?mode=mixed',
      type: 'drill',
      concept: weakest?.id,
    };
  }
  return {
    title: 'Final Exam Gauntlet',
    description: 'You are ready for a capstone run: five stages, three lives, no filler questions.',
    cta: 'Enter the gauntlet',
    to: '/arcade/gauntlet',
    type: 'game',
    concept: weakest?.id,
  };
}

export function dailyChallengeFor(state: AppState): string[] {
  const date = dateKey();
  if (state.dailyChallenge.date === date && state.dailyChallenge.questionIds.length) {
    return state.dailyChallenge.questionIds;
  }
  const picks = selectQuestions(state, {
    count: 5,
    types: ['mcq', 'truefalse', 'fill', 'multi'],
    minDifficulty: 2,
    maxDifficulty: 4,
    avoidRecent: false,
  });
  return picks.map((q) => q.id);
}

export function topicName(topic: TopicId) {
  return TOPICS.find((t) => t.id === topic)?.name ?? topic;
}

export function normalizeConceptList(ids: string[]) {
  return ids.filter((id) => !!CONCEPT_MAP[id]);
}

export function attemptsForQuestion(state: AppState, questionId: string): Attempt[] {
  return state.attempts.filter((a) => a.questionId === questionId);
}