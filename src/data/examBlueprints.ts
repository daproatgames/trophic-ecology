import type { AppState, Question } from '../types';
import { selectQuestions } from '../lib/learning';

export interface ExamQuestion {
  question: Question;
  points: number;
  section: string;
}

export interface ExamSection {
  id: string;
  title: string;
  instructions: string;
  questions: ExamQuestion[];
  points: number;
}

export interface ExamPlan {
  id: string;
  name: string;
  description: string;
  minutes: number;
  totalPoints: number;
  sections: ExamSection[];
  teacherStyle?: boolean;
}

export interface BlueprintMeta {
  id: string;
  name: string;
  short: string;
  description: string;
  minutes: number;
  marks: string;
  difficulty: string;
  icon: string;
  color: string;
  recommended?: boolean;
  teacherStyle?: boolean;
}

export const EXAM_BLUEPRINTS: BlueprintMeta[] = [
  {
    id: 'teacher-style',
    name: 'Teacher-Style Mock',
    short: 'Parallel form',
    description: 'A fresh 50-mark paper modeled on the structure of your practice test: multiple choice, process matching, modified true/false and written answers. No copied questions.',
    minutes: 50,
    marks: '50 marks',
    difficulty: 'Mixed · exam-realistic',
    icon: 'School',
    color: '#B7F34A',
    recommended: true,
    teacherStyle: true,
  },
  {
    id: 'quick',
    name: 'Quick Check',
    short: '20 min',
    description: 'A short mixed exam covering all topics. Good for a low-stakes readiness check before a study session.',
    minutes: 25,
    marks: '27 marks',
    difficulty: 'Mixed',
    icon: 'Timer',
    color: '#4DE1C1',
  },
  {
    id: 'full',
    name: 'Full-Length Mock',
    short: '60 min',
    description: 'A complete 70-mark paper spanning all seven topics, with multiple choice, true/false, fill-ins, short answers and application questions.',
    minutes: 60,
    marks: '70 marks',
    difficulty: 'Mixed → hard',
    icon: 'FileText',
    color: '#7DD3FC',
  },
  {
    id: 'challenge',
    name: 'Challenge Paper',
    short: '45 min',
    description: 'Harder application and synthesis questions. Designed for when you already know the basics and need to stress-test understanding.',
    minutes: 45,
    marks: '60 marks',
    difficulty: 'Hard · application',
    icon: 'Flame',
    color: '#FF8A65',
  },
];

export const EXAM_MAP: Record<string, BlueprintMeta> = Object.fromEntries(
  EXAM_BLUEPRINTS.map((b) => [b.id, b]),
);

function take(
  state: AppState,
  count: number,
  types: Question['type'][],
  exclude: string[],
  opts: { minDifficulty?: number; maxDifficulty?: number; teacherStyle?: boolean; topics?: Question['topic'][] } = {},
): Question[] {
  const picked = selectQuestions(state, {
    count,
    types,
    excludeIds: exclude,
    minDifficulty: opts.minDifficulty ?? 1,
    maxDifficulty: opts.maxDifficulty ?? 5,
    teacherStyle: opts.teacherStyle,
    topics: opts.topics,
    avoidRecent: true,
  });
  return picked;
}

function section(id: string, title: string, instructions: string, questions: { question: Question; points: number }[]): ExamSection {
  return {
    id,
    title,
    instructions,
    questions: questions.map((q) => ({ ...q, section: id })),
    points: questions.reduce((s, q) => s + q.points, 0),
  };
}

export function buildExamPlan(state: AppState, blueprintId: string): ExamPlan {
  const used: string[] = [];
  const blueprint = EXAM_MAP[blueprintId] ?? EXAM_MAP.quick;

  if (blueprintId === 'teacher-style') {
    const a = take(state, 15, ['mcq'], used, { teacherStyle: true });
    used.push(...a.map((q) => q.id));
    const a2 = a.length < 15 ? [...a, ...take(state, 15 - a.length, ['mcq'], used)] : a;
    used.length = 0;
    used.push(...a2.map((q) => q.id));

    const b = take(state, 5, ['multi'], used);
    used.push(...b.map((q) => q.id));
    const c = take(state, 5, ['truefalse'], used);
    used.push(...c.map((q) => q.id));
    const d = take(state, 8, ['short', 'scenario', 'error', 'causeeffect', 'compare'], used);
    const dPoints = [3, 3, 3, 3, 3, 3, 3, 4];
    const sections = [
      section('part-a', 'Part A — Multiple Choice', 'Choose the most correct answer. 1 mark each.', a2.map((q) => ({ question: q, points: 1 }))),
      section('part-b', 'Part B — Process Matching', 'Select all processes that apply. 1 mark each; all required selections must be correct.', b.map((q) => ({ question: q, points: 1 }))),
      section('part-c', 'Part C — True or False', 'Decide whether each statement is true or false. 1 mark each.', c.map((q) => ({ question: q, points: 1 }))),
      section('part-d', 'Part D — Written Answers', 'Answer in complete sentences. Marks are shown for each question; use precise scientific terminology.', d.map((q, i) => ({ question: q, points: dPoints[i] ?? 3 }))),
    ];
    return {
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.description,
      minutes: blueprint.minutes,
      totalPoints: sections.reduce((s, x) => s + x.points, 0),
      sections,
      teacherStyle: true,
    };
  }

  if (blueprintId === 'quick') {
    const mc = take(state, 15, ['mcq'], used);
    used.push(...mc.map((q) => q.id));
    const fill = take(state, 3, ['fill'], used);
    used.push(...fill.map((q) => q.id));
    const written = take(state, 2, ['short'], used);
    used.push(...written.map((q) => q.id));
    const sections = [
      section('mcq', 'Section A — Multiple Choice', 'Choose the best answer.', mc.map((q) => ({ question: q, points: 1 }))),
      section('fill', 'Section B — Fill in the Blanks', 'Type the missing terms. 2 marks each.', fill.map((q) => ({ question: q, points: 2 }))),
      section('short', 'Section C — Short Answer', 'Answer precisely. 3 marks each.', written.map((q) => ({ question: q, points: 3 }))),
    ];
    return { id: blueprint.id, name: blueprint.name, description: blueprint.description, minutes: blueprint.minutes, totalPoints: sections.reduce((s, x) => s + x.points, 0), sections };
  }

  if (blueprintId === 'challenge') {
    const mc = take(state, 12, ['mcq'], used, { minDifficulty: 4 });
    used.push(...mc.map((q) => q.id));
    const multi = take(state, 4, ['multi'], used, { minDifficulty: 3 });
    used.push(...multi.map((q) => q.id));
    const written = take(state, 4, ['short', 'scenario', 'error', 'causeeffect', 'compare'], used, { minDifficulty: 3 });
    used.push(...written.map((q) => q.id));
    const app = take(state, 2, ['scenario', 'causeeffect'], used, { minDifficulty: 4 });
    const sections = [
      section('mcq', 'Section A — Hard Multiple Choice', 'Choose the most precise answer. 2 marks each.', mc.map((q) => ({ question: q, points: 2 }))),
      section('multi', 'Section B — Multiple Select', 'Select every correct option. 2 marks each; all must be correct.', multi.map((q) => ({ question: q, points: 2 }))),
      section('written', 'Section C — Written Reasoning', 'Explain your reasoning with precise terminology. 4 marks each.', written.map((q) => ({ question: q, points: 4 }))),
      section('app', 'Section D — Application', 'Apply the science to a new scenario. 6 marks each.', app.map((q) => ({ question: q, points: 6 }))),
    ];
    return { id: blueprint.id, name: blueprint.name, description: blueprint.description, minutes: blueprint.minutes, totalPoints: sections.reduce((s, x) => s + x.points, 0), sections };
  }

  // Full-length paper
  const mc = take(state, 20, ['mcq'], used, { maxDifficulty: 5 });
  used.push(...mc.map((q) => q.id));
  const tf = take(state, 5, ['truefalse'], used);
  used.push(...tf.map((q) => q.id));
  const fill = take(state, 5, ['fill'], used);
  used.push(...fill.map((q) => q.id));
  const written = take(state, 5, ['short'], used);
  used.push(...written.map((q) => q.id));
  const app = take(state, 5, ['scenario', 'causeeffect', 'compare', 'error'], used);
  const sections = [
    section('mcq', 'Section A — Multiple Choice', 'Choose the most correct answer. 1 mark each.', mc.map((q) => ({ question: q, points: 1 }))),
    section('tf', 'Section B — True or False', 'Decide whether each statement is true or false. 1 mark each.', tf.map((q) => ({ question: q, points: 1 }))),
    section('fill', 'Section C — Fill in the Blanks', 'Type the missing terms. 2 marks each.', fill.map((q) => ({ question: q, points: 2 }))),
    section('short', 'Section D — Short Answer', 'Answer in complete sentences. 3 marks each.', written.map((q) => ({ question: q, points: 3 }))),
    section('app', 'Section E — Application', 'Apply the science to new scenarios. 4 marks each.', app.map((q) => ({ question: q, points: 4 }))),
  ];
  return { id: blueprint.id, name: blueprint.name, description: blueprint.description, minutes: blueprint.minutes, totalPoints: sections.reduce((s, x) => s + x.points, 0), sections };
}