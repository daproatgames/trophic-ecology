import type { AiGrade, ExamAnswer, ExamResult } from '../types';
import type { ExamPlan } from '../data/examBlueprints';
import { gradeQuestion } from './grading';

export interface ExamDraft {
  blueprintId: string;
  timed: boolean;
  answers: ExamAnswer[];
  index: number;
  startedAt: number;
  planName: string;
  plan?: ExamPlan;
}

export function emptyAnswers(plan: ExamPlan): ExamAnswer[] {
  return plan.sections.flatMap((section) =>
    section.questions.map((q) => ({
      questionId: q.question.id,
      response: q.question.type === 'multi' || q.question.type === 'fill' ? [] : '',
      flagged: false,
      points: q.points,
      section: section.id,
    })),
  );
}

const WRITTEN_TYPES = ['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'];

export function gradeExamPlan(
  plan: ExamPlan,
  answers: ExamAnswer[],
  startedAt: number,
  endedAt = Date.now(),
  ai?: { grades: Record<string, AiGrade>; model?: string; error?: string },
): ExamResult {
  const byTopic: Record<string, { earned: number; total: number }> = {};
  const bySection: Record<string, { earned: number; total: number }> = {};
  let totalEarned = 0;
  let totalPoints = 0;
  const graded: ExamAnswer[] = answers.map((answer) => {
    const section = plan.sections.find((s) => s.id === answer.section);
    const item = section?.questions.find((q) => q.question.id === answer.questionId);
    if (!item) return answer;
    const points = answer.points ?? item.points;
    const aiGrade = WRITTEN_TYPES.includes(item.question.type) ? ai?.grades[answer.questionId] : undefined;
    const score = aiGrade ? Math.max(0, Math.min(1, aiGrade.awarded / Math.max(1, item.points))) : gradeQuestion(item.question, answer.response, false).score;
    const earned = score * points;
    totalEarned += earned;
    totalPoints += points;
    const topic = item.question.topic;
    if (!byTopic[topic]) byTopic[topic] = { earned: 0, total: 0 };
    byTopic[topic].earned += earned;
    byTopic[topic].total += points;
    if (!bySection[answer.section ?? section!.id]) bySection[answer.section ?? section!.id] = { earned: 0, total: 0 };
    bySection[answer.section ?? section!.id].earned += earned;
    bySection[answer.section ?? section!.id].total += points;
    return { ...answer, score, points, ai: aiGrade ?? answer.ai };
  });
  return {
    id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    blueprintId: plan.id,
    blueprintName: plan.name,
    at: endedAt,
    durationMs: endedAt - startedAt,
    answers: graded,
    totalEarned: Math.round(totalEarned * 10) / 10,
    totalPoints,
    byTopic,
    bySection,
    autoGraded: true,
    aiGraded: !!ai && Object.keys(ai.grades).length > 0,
    aiModel: ai?.model,
    aiError: ai?.error,
  };
}

export function examPct(result: ExamResult): number {
  return result.totalPoints ? Math.round((result.totalEarned / result.totalPoints) * 100) : 0;
}

export function saveExamDraft(draft: ExamDraft) {
  try { sessionStorage.setItem('trophic-exam-draft', JSON.stringify(draft)); } catch { /* ignore */ }
}
export function loadExamDraft(): ExamDraft | null {
  try { const raw = sessionStorage.getItem('trophic-exam-draft'); return raw ? JSON.parse(raw) as ExamDraft : null; } catch { return null; }
}
export function clearExamDraft() {
  try { sessionStorage.removeItem('trophic-exam-draft'); } catch { /* ignore */ }
}

export function saveExamStart(config: { blueprintId: string; timed: boolean }) {
  try { sessionStorage.setItem('trophic-exam-start', JSON.stringify(config)); } catch { /* ignore */ }
}
export function loadExamStart(): { blueprintId: string; timed: boolean } | null {
  try { const raw = sessionStorage.getItem('trophic-exam-start'); return raw ? JSON.parse(raw) as { blueprintId: string; timed: boolean } : null; } catch { return null; }
}