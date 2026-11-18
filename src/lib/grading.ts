import type { Question } from '../types';

const SUBSCRIPTS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁻': '-', '⁺': '+',
};

export function normalizeText(input: string | number | boolean | null | undefined): string {
  if (input === null || input === undefined) return '';
  let s = String(input).toLowerCase();
  s = s.replace(/[₀-₉⁰-⁹⁻⁺]/g, (ch) => SUBSCRIPTS[ch] ?? ch);
  s = s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/[^a-z0-9%.\s-]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function phraseIn(haystack: string, needle: string): boolean {
  const n = normalizeText(needle);
  if (!n) return false;
  if (haystack === n) return true;
  const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(haystack);
}

export interface BlankResult {
  index: number;
  correct: boolean;
  response: string;
  accepted: string;
}

export interface GradeResult {
  score: number; // 0..1
  correct: boolean;
  auto: boolean;
  blankResults?: BlankResult[];
  matched?: string[];
  missing?: string[];
  strict?: boolean;
}

export function gradeFill(question: Question, response: string[]): GradeResult {
  const blanks = question.blanks ?? [];
  const blankResults: BlankResult[] = blanks.map((b, i) => {
    const normalized = normalizeText(response[i] ?? '');
    const correct = b.accepted.some((group) => group.some((a) => phraseIn(normalized, a)));
    return {
      index: i,
      correct,
      response: response[i] ?? '',
      accepted: b.accepted.map((g) => g[0]).join(' / '),
    };
  });
  const correctCount = blankResults.filter((b) => b.correct).length;
  const score = blanks.length ? correctCount / blanks.length : 0;
  return { score, correct: score >= 0.999, auto: true, blankResults };
}

export function gradeRubric(question: Question, response: string): GradeResult {
  const normalized = normalizeText(response);
  const rubric = question.rubric ?? [];
  const matched: string[] = [];
  const missing: string[] = [];
  for (const group of rubric) {
    const hit = group.synonyms.some((s) => phraseIn(normalized, s));
    if (hit) matched.push(group.label);
    else missing.push(group.label);
  }
  const score = rubric.length ? matched.length / rubric.length : normalized.length > 10 ? 0.5 : 0;
  return { score, correct: score >= 0.6, auto: true, matched, missing };
}

export function gradeQuestion(
  question: Question,
  response: string | number | string[] | number[] | boolean | null | undefined,
  partial = false,
): GradeResult {
  switch (question.type) {
    case 'mcq':
    case 'truefalse': {
      const idx = typeof response === 'number' ? response : -1;
      return { score: idx === question.answer ? 1 : 0, correct: idx === question.answer, auto: true };
    }
    case 'multi': {
      const selected = (Array.isArray(response) ? response : []).map((x) => Number(x)).filter((n) => Number.isFinite(n));
      const target = Array.isArray(question.answer) ? question.answer.map(Number) : [];
      const exact =
        selected.length === target.length && target.every((t) => selected.includes(t));
      if (!partial) return { score: exact ? 1 : 0, correct: exact, auto: true, strict: true };
      const hits = selected.filter((s) => target.includes(s)).length;
      const wrong = selected.filter((s) => !target.includes(s)).length;
      const score = Math.max(0, Math.min(1, (hits - wrong) / Math.max(1, target.length)));
      return { score, correct: exact, auto: true };
    }
    case 'fill':
      return gradeFill(question, Array.isArray(response) ? (response as unknown as string[]) : []);
    case 'short':
    case 'scenario':
    case 'error':
    case 'causeeffect':
    case 'compare':
    case 'teachback':
      return gradeRubric(question, typeof response === 'string' ? response : '');
    default:
      return { score: 0, correct: false, auto: false };
  }
}

export function selfScoreToCorrect(score: number): boolean {
  return score >= 0.7;
}

export function formatAnswer(question: Question): string {
  if (question.type === 'mcq' || question.type === 'truefalse') {
    const idx = typeof question.answer === 'number' ? question.answer : 0;
    return question.options?.[idx] ?? '';
  }
  if (question.type === 'multi' && Array.isArray(question.answer)) {
    return question.answer.map((i) => question.options?.[i] ?? '').join('; ');
  }
  if (question.type === 'fill') {
    return (question.blanks ?? []).map((b, i) => `Blank ${i + 1}: ${b.accepted[0].join(' / ')}`).join('; ');
  }
  return question.modelAnswer ?? '';
}