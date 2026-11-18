import type { Question, TopicId } from '../../types';
import { foundationsQuestions } from './foundations';
import { foodWebQuestions } from './foodwebs';
import { pyramidQuestions } from './pyramids';
import { energyQuestions } from './energy';
import { cycleQuestions } from './cycles';
import { nitrogenQuestions } from './nitrogen';
import { integrationQuestions } from './integration';

function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Options were authored with the correct answer first far too often. Rotate
// options deterministically per question, remapping the answer and trap notes.
// This keeps grading and feedback consistent everywhere while removing the
// "always option 1" pattern.
function balanceQuestion(q: Question): Question {
  if (!q.options || q.options.length < 2 || q.type === 'truefalse') return q;
  const n = q.options.length;
  const offset = hashString(q.id) % n;
  if (offset === 0) return q;
  const options = [...q.options.slice(offset), ...q.options.slice(0, offset)];
  const remap = (old: number) => (old - offset + n) % n;
  let answer = q.answer;
  if (typeof answer === 'number') answer = remap(answer);
  else if (Array.isArray(answer)) answer = answer.map((x) => remap(Number(x)));
  const whyWrong = q.whyWrong ? Object.fromEntries(Object.entries(q.whyWrong).map(([old, reason]) => [String(remap(Number(old))), reason])) : undefined;
  return { ...q, options, answer, whyWrong };
}

export const QUESTIONS: Question[] = [
  ...foundationsQuestions,
  ...foodWebQuestions,
  ...pyramidQuestions,
  ...energyQuestions,
  ...cycleQuestions,
  ...nitrogenQuestions,
  ...integrationQuestions,
].map(balanceQuestion);

export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export const QUESTION_SETS: Record<TopicId, Question[]> = {
  foundations: foundationsQuestions.map(balanceQuestion),
  foodwebs: foodWebQuestions.map(balanceQuestion),
  pyramids: pyramidQuestions.map(balanceQuestion),
  energy: energyQuestions.map(balanceQuestion),
  cycles: cycleQuestions.map(balanceQuestion),
  nitrogen: nitrogenQuestions.map(balanceQuestion),
  integration: integrationQuestions.map(balanceQuestion),
};

export function questionsForConcept(conceptId: string): Question[] {
  return QUESTIONS.filter((q) => q.concepts.includes(conceptId));
}

export function questionsForTopic(topicId: TopicId): Question[] {
  return QUESTION_SETS[topicId];
}

export function getQuestion(id: string): Question | undefined {
  return QUESTION_MAP[id];
}

// A quick dev-time integrity check surfaced in the settings/diagnostics panel.
export function questionBankIntegrity() {
  const ids = new Set<string>();
  const duplicates: string[] = [];
  const missingConcepts = new Set<string>();
  const badOptions: string[] = [];
  for (const q of QUESTIONS) {
    if (ids.has(q.id)) duplicates.push(q.id);
    ids.add(q.id);
    if (q.type === 'mcq' && (!q.options || q.options.length < 2)) badOptions.push(q.id);
    if (q.type === 'mcq' && typeof q.answer !== 'number') badOptions.push(q.id);
  }
  return { total: QUESTIONS.length, duplicates, missingConcepts: [...missingConcepts], badOptions };
}