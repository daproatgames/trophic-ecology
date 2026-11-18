import type { Question, QuestionType, TopicId } from '../../types';

export type Draft = Omit<Question, 'source' | 'topic' | 'type'> & { type?: QuestionType; source?: string };

export const SOURCES: Record<TopicId, string> = {
  foundations: 'Slides 1 — Introducing Ecology',
  foodwebs: 'Slides 2 — Food Chains and Food Webs',
  pyramids: 'Slides 2 — Ecological Pyramids',
  energy: 'Slides 3 — Energy in Ecosystems',
  cycles: 'Slides 4 — Water and Carbon Cycles',
  nitrogen: 'Slides 5 — Nitrogen Cycle',
  integration: 'Unit synthesis + marked practice test',
};

export function topicFactory(topic: TopicId) {
  const wrap = (o: Draft): Question => ({
    type: 'mcq',
    ...o,
    topic,
    source: o.source ?? SOURCES[topic],
  });

  const mcq = (o: Draft): Question => wrap({ ...o, type: 'mcq' });
  const multi = (o: Draft): Question => wrap({ ...o, type: 'multi' });
  const tf = (o: Draft & { answer: 0 | 1 }): Question =>
    wrap({ ...o, type: 'truefalse', options: ['True', 'False'] });
  const fill = (o: Draft): Question => wrap({ ...o, type: 'fill' });
  const open = (type: QuestionType) => (o: Draft): Question => wrap({ ...o, type });

  return { mcq, multi, tf, fill, open };
}