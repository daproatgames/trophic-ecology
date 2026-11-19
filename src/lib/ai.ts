import type { AiGrade } from '../types';

// The key is intentionally restricted to the TROPHIC production host and the
// Gemini API. It is a browser key, not a server secret; a custom key can be
// supplied in localStorage for local experiments.
const GEMINI_KEY = (import.meta.env.VITE_GEMINI_KEY as string | undefined)?.trim() || '';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface AiMarkItem {
  id: string;
  prompt: string;
  context?: string;
  points: number;
  studentAnswer: string;
  modelAnswer: string;
  rubric: string[];
}

export interface AiMarkResult {
  ok: boolean;
  grades: Record<string, AiGrade>;
  model?: string;
  error?: string;
}

function getKey() {
  try {
    return localStorage.getItem('trophic-ai-key')?.trim() || GEMINI_KEY;
  } catch {
    return GEMINI_KEY;
  }
}

const SYSTEM_PROMPT = `You are an experienced Grade 9 biology teacher marking a unit test on ecology.

Mark each written answer strictly against its model answer and marking points. Award partial credit for scientifically correct ideas expressed in any wording. Do not require exact keywords. Do not award marks for vague, contradictory, or unsupported statements. Use half marks where the question allows them.

For every item return:
- id: the exact item id
- awarded: a number from 0 to the item's maximum, in 0.5 increments
- feedback: 1-2 concise sentences. State what earned credit and the single most important correction or missing idea.

If an answer is blank or off-topic, award 0 and say so briefly. Return only the JSON requested by the schema.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    grades: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          awarded: { type: 'NUMBER' },
          feedback: { type: 'STRING' },
        },
        required: ['id', 'awarded', 'feedback'],
      },
    },
  },
  required: ['grades'],
} as const;

function clean(value: string, max = 4000) {
  return value.trim().slice(0, max);
}

export async function markWrittenAnswers(items: AiMarkItem[]): Promise<AiMarkResult> {
  const usable = items.filter((item) => item.studentAnswer.trim() && item.points > 0);
  if (!usable.length) return { ok: true, grades: {}, model: GEMINI_MODEL };
  if (!getKey()) {
    return { ok: false, grades: {}, model: GEMINI_MODEL, error: 'AI marking is not configured in this build. Rubric marks are shown instead.' };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 35_000);
  try {
    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{
        role: 'user',
        parts: [{
          text: `Mark these written answers. The maximum for each item is shown in "points". Return one grade for every id.\n\nITEMS:\n${JSON.stringify(usable.map((item) => ({
            id: item.id,
            prompt: item.prompt,
            context: item.context ?? '',
            points: item.points,
            studentAnswer: clean(item.studentAnswer),
            modelAnswer: item.modelAnswer,
            markingPoints: item.rubric,
          })))}`,
        }],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2400,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': getKey(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await response.text().catch(() => '');
      const quota = response.status === 429;
      return {
        ok: false,
        grades: {},
        model: GEMINI_MODEL,
        error: quota
          ? 'The AI marker is busy right now. Rubric marks are shown instead.'
          : `AI marking was unavailable (${response.status}). Rubric marks are shown instead.`,
      };
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    const parsed = JSON.parse(text) as { grades?: { id?: string; awarded?: number; feedback?: string }[] };
    const grades: Record<string, AiGrade> = {};
    for (const item of usable) {
      const raw = parsed.grades?.find((grade) => grade.id === item.id);
      if (!raw) continue;
      const numeric = Number(raw.awarded);
      if (!Number.isFinite(numeric)) continue;
      const awarded = Math.max(0, Math.min(item.points, Math.round(numeric * 2) / 2));
      grades[item.id] = {
        awarded,
        feedback: String(raw.feedback ?? '').trim().slice(0, 600) || 'Marked against the model answer.',
        model: GEMINI_MODEL,
      };
    }

    if (!Object.keys(grades).length) {
      return { ok: false, grades: {}, model: GEMINI_MODEL, error: 'The AI marker returned no usable marks. Rubric marks are shown instead.' };
    }
    return { ok: true, grades, model: GEMINI_MODEL };
  } catch (error) {
    return {
      ok: false,
      grades: {},
      model: GEMINI_MODEL,
      error: error instanceof Error && error.name === 'AbortError'
        ? 'AI marking timed out. Rubric marks are shown instead.'
        : 'Could not reach the AI marker. Rubric marks are shown instead.',
    };
  } finally {
    window.clearTimeout(timeout);
  }
}