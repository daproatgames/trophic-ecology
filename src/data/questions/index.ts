import type { Question, TopicId } from '../../types';
import { foundationsQuestions } from './foundations';
import { foodWebQuestions } from './foodwebs';
import { pyramidQuestions } from './pyramids';
import { energyQuestions } from './energy';
import { cycleQuestions } from './cycles';
import { nitrogenQuestions } from './nitrogen';
import { integrationQuestions } from './integration';

export const QUESTIONS: Question[] = [
  ...foundationsQuestions,
  ...foodWebQuestions,
  ...pyramidQuestions,
  ...energyQuestions,
  ...cycleQuestions,
  ...nitrogenQuestions,
  ...integrationQuestions,
];

export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export const QUESTION_SETS: Record<TopicId, Question[]> = {
  foundations: foundationsQuestions,
  foodwebs: foodWebQuestions,
  pyramids: pyramidQuestions,
  energy: energyQuestions,
  cycles: cycleQuestions,
  nitrogen: nitrogenQuestions,
  integration: integrationQuestions,
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