import type { Analytics, AppState } from '../types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xp: number;
  check: (state: AppState, analytics: Analytics) => boolean;
  progress?: (state: AppState, analytics: Analytics) => { value: number; target: number };
}

const attempts = (s: AppState) => s.attempts.length;
const topicAtLeast = (a: Analytics, topic: string, value: number) =>
  (a.topicMastery as Record<string, number>)[topic] >= value;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-signal', name: 'First Signal', description: 'Answer your first question.', icon: 'Radio', tier: 'bronze', xp: 25,
    check: (s) => attempts(s) >= 1, progress: (s) => ({ value: Math.min(1, attempts(s)), target: 1 }),
  },
  {
    id: 'ten-down', name: 'Warmed Up', description: 'Answer 10 questions.', icon: 'Flame', tier: 'bronze', xp: 40,
    check: (s) => attempts(s) >= 10, progress: (s) => ({ value: Math.min(10, attempts(s)), target: 10 }),
  },
  {
    id: 'half-century', name: 'Retrieval Rookie', description: 'Answer 50 questions.', icon: 'Layers', tier: 'silver', xp: 90,
    check: (s) => attempts(s) >= 50, progress: (s) => ({ value: Math.min(50, attempts(s)), target: 50 }),
  },
  {
    id: 'hundred-club', name: 'Hundred Club', description: 'Answer 100 questions.', icon: 'Trophy', tier: 'gold', xp: 150,
    check: (s) => attempts(s) >= 100, progress: (s) => ({ value: Math.min(100, attempts(s)), target: 100 }),
  },
  {
    id: 'type-titan', name: 'Type Titan', description: 'Use at least 5 different question formats.', icon: 'Shapes', tier: 'silver', xp: 80,
    check: (s) => new Set(s.attempts.map((a) => a.type)).size >= 5,
    progress: (s) => ({ value: Math.min(5, new Set(s.attempts.map((a) => a.type)).size), target: 5 }),
  },
  {
    id: 'mistake-fixer', name: 'Mistake Mechanic', description: 'Answer a question correctly after previously getting it wrong.', icon: 'Wrench', tier: 'silver', xp: 70,
    check: (s) => {
      const byQ = new Map<string, boolean[]>();
      s.attempts.forEach((a) => {
        const arr = byQ.get(a.questionId) ?? [];
        arr.push(a.correct >= 0.7);
        byQ.set(a.questionId, arr);
      });
      return [...byQ.values()].some((arr) => arr.some((x) => !x) && arr[arr.length - 1]);
    },
  },
  {
    id: 'hard-hitter', name: 'Hard Hitter', description: 'Answer 10 hard questions (difficulty 4+) correctly.', icon: 'Swords', tier: 'gold', xp: 120,
    check: (s) => s.attempts.filter((a) => a.correct >= 0.7 && a.difficulty >= 4).length >= 10,
    progress: (s) => ({ value: Math.min(10, s.attempts.filter((a) => a.correct >= 0.7 && a.difficulty >= 4).length), target: 10 }),
  },
  {
    id: 'deep-thinker', name: 'Deep Thinker', description: 'Score full marks on 5 written or applied answers.', icon: 'Brain', tier: 'gold', xp: 120,
    check: (s) => s.attempts.filter((a) => a.correct >= 0.999 && ['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'].includes(a.type)).length >= 5,
    progress: (s) => ({ value: Math.min(5, s.attempts.filter((a) => a.correct >= 0.999 && ['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'].includes(a.type)).length), target: 5 }),
  },
  {
    id: 'streak-3', name: 'Momentum', description: 'Study on 3 days in a row.', icon: 'CalendarFlame', tier: 'bronze', xp: 60,
    check: (s) => s.streak.current >= 3 || s.streak.longest >= 3,
    progress: (s) => ({ value: Math.min(3, Math.max(s.streak.current, s.streak.longest)), target: 3 }),
  },
  {
    id: 'streak-7', name: 'Seven-Day Scientist', description: 'Study on 7 days in a row.', icon: 'CalendarCheck', tier: 'gold', xp: 180,
    check: (s) => s.streak.current >= 7 || s.streak.longest >= 7,
    progress: (s) => ({ value: Math.min(7, Math.max(s.streak.current, s.streak.longest)), target: 7 }),
  },
  {
    id: 'session-streak-10', name: 'In the Zone', description: 'Get 10 correct answers in a row.', icon: 'Zap', tier: 'silver', xp: 90,
    check: (s) => s.bestSessionStreak >= 10,
    progress: (s) => ({ value: Math.min(10, s.bestSessionStreak), target: 10 }),
  },
  {
    id: 'foundations-master', name: 'Groundwork', description: 'Reach 75% mastery in Ecology Foundations.', icon: 'Sprout', tier: 'silver', xp: 100,
    check: (_s, a) => topicAtLeast(a, 'foundations', 75),
    progress: (_s, a) => ({ value: a.topicMastery.foundations, target: 75 }),
  },
  {
    id: 'web-weaver', name: 'Web Weaver', description: 'Reach 75% mastery in Food Chains & Webs.', icon: 'Share2', tier: 'silver', xp: 100,
    check: (_s, a) => topicAtLeast(a, 'foodwebs', 75),
    progress: (_s, a) => ({ value: a.topicMastery.foodwebs, target: 75 }),
  },
  {
    id: 'pyramid-scheme', name: 'Pyramid Scheme', description: 'Reach 75% mastery in Ecological Pyramids.', icon: 'Triangle', tier: 'silver', xp: 100,
    check: (_s, a) => topicAtLeast(a, 'pyramids', 75),
    progress: (_s, a) => ({ value: a.topicMastery.pyramids, target: 75 }),
  },
  {
    id: 'energy-expert', name: 'Reaction Master', description: 'Reach 75% mastery in Energy & Matter.', icon: 'Zap', tier: 'gold', xp: 120,
    check: (_s, a) => topicAtLeast(a, 'energy', 75),
    progress: (_s, a) => ({ value: a.topicMastery.energy, target: 75 }),
  },
  {
    id: 'cycle-sage', name: 'Cycle Sage', description: 'Reach 75% mastery in Water & Carbon Cycles.', icon: 'RefreshCw', tier: 'gold', xp: 120,
    check: (_s, a) => topicAtLeast(a, 'cycles', 75),
    progress: (_s, a) => ({ value: a.topicMastery.cycles, target: 75 }),
  },
  {
    id: 'nitrogen-knight', name: 'Nitrogen Knight', description: 'Reach 78% mastery in the Nitrogen Cycle.', icon: 'Atom', tier: 'gold', xp: 150,
    check: (_s, a) => topicAtLeast(a, 'nitrogen', 78),
    progress: (_s, a) => ({ value: a.topicMastery.nitrogen, target: 78 }),
  },
  {
    id: 'connections-master', name: 'Systems Thinker', description: 'Reach 75% mastery in Connections & Exam Skills.', icon: 'Workflow', tier: 'gold', xp: 120,
    check: (_s, a) => topicAtLeast(a, 'integration', 75),
    progress: (_s, a) => ({ value: a.topicMastery.integration, target: 75 }),
  },
  {
    id: 'lesson-one', name: 'Field Notes', description: 'Complete your first lesson.', icon: 'BookOpen', tier: 'bronze', xp: 50,
    check: (s) => Object.values(s.lessons).some((l) => l.completed),
    progress: (s) => ({ value: Object.values(s.lessons).filter((l) => l.completed).length, target: 1 }),
  },
  {
    id: 'scholar', name: 'Ecosystem Scholar', description: 'Complete all 7 lessons.', icon: 'GraduationCap', tier: 'platinum', xp: 250,
    check: (s) => Object.values(s.lessons).filter((l) => l.completed).length >= 7,
    progress: (s) => ({ value: Object.values(s.lessons).filter((l) => l.completed).length, target: 7 }),
  },
  {
    id: 'teachback-3', name: 'Explain It', description: 'Complete 3 teach-back exercises.', icon: 'MessageSquare', tier: 'silver', xp: 90,
    check: (s) => s.attempts.filter((a) => a.type === 'teachback').length >= 3,
    progress: (s) => ({ value: Math.min(3, s.attempts.filter((a) => a.type === 'teachback').length), target: 3 }),
  },
  {
    id: 'comeback', name: 'Comeback Kid', description: 'Get a correct answer after 3 wrong answers in a row.', icon: 'Undo2', tier: 'silver', xp: 80,
    check: (s) => {
      let wrongRun = 0;
      for (const a of s.attempts) {
        if (a.correct < 0.7) wrongRun++;
        else {
          if (wrongRun >= 3) return true;
          wrongRun = 0;
        }
      }
      return false;
    },
  },
  {
    id: 'data-whiz', name: 'Data Whiz', description: 'Correctly answer 5 energy-calculation questions.', icon: 'Calculator', tier: 'silver', xp: 90,
    check: (s) => s.attempts.filter((a) => a.correct >= 0.7 && a.concepts.includes('data-calculation')).length >= 5,
    progress: (s) => ({ value: Math.min(5, s.attempts.filter((a) => a.correct >= 0.7 && a.concepts.includes('data-calculation')).length), target: 5 }),
  },
  {
    id: 'boss-slayer', name: 'Boss Slayer', description: 'Defeat any science boss.', icon: 'Skull', tier: 'gold', xp: 150,
    check: (s) => Object.entries(s.gameBests).some(([id, best]) => id.startsWith('boss-') && best.detail?.won === 1),
  },
  {
    id: 'showdown-champion', name: 'Showdown Champion', description: 'Win a Science Showdown against the rivals.', icon: 'Crown', tier: 'silver', xp: 100,
    check: (s) => s.gameBests.showdown?.detail?.won === 1,
  },
  {
    id: 'escape-artist', name: 'Escape Artist', description: 'Escape the Ecology Vault.', icon: 'DoorOpen', tier: 'gold', xp: 160,
    check: (s) => s.gameBests.escape?.detail?.escaped === 1,
  },
  {
    id: 'wordle-whiz', name: 'Term Cracker', description: 'Solve a Science Wordle round.', icon: 'Grid3X3', tier: 'bronze', xp: 60,
    check: (s) => Number(s.gameBests.wordle?.detail?.solved ?? 0) >= 1,
  },
  {
    id: 'memory-master', name: 'Perfect Recall', description: 'Finish a Memory Match deck with 100% accuracy.', icon: 'Copy', tier: 'silver', xp: 90,
    check: (s) => (s.gameBests.memory?.accuracy ?? 0) >= 100,
  },
  {
    id: 'kart-champion', name: 'Fuel Champion', description: 'Win a Fuel Kart 3D race.', icon: 'Flag', tier: 'silver', xp: 100,
    check: (s) => s.gameBests.karting?.detail?.won === 1,
  },
  {
    id: 'gauntlet-survivor', name: 'Gauntlet Survivor', description: 'Complete all five stages of the Final Exam Gauntlet.', icon: 'Sword', tier: 'platinum', xp: 300,
    check: (s) => s.gameBests.gauntlet?.detail?.completed === 1,
  },
  {
    id: 'exam-ace', name: 'Exam Ace', description: 'Score 90% or higher on any mock exam.', icon: 'Award', tier: 'gold', xp: 200,
    check: (s) => s.exams.some((e) => e.totalPoints > 0 && e.totalEarned / e.totalPoints >= 0.9),
  },
  {
    id: 'teacher-style-80', name: 'Teacher\'s Test', description: 'Score 80%+ on a teacher-style mock exam.', icon: 'School', tier: 'gold', xp: 180,
    check: (s) => s.exams.some((e) => e.blueprintId === 'teacher-style' && e.totalPoints > 0 && e.totalEarned / e.totalPoints >= 0.8),
  },
  {
    id: 'readiness-70', name: 'Test Ready', description: 'Reach 70% overall test readiness.', icon: 'ShieldCheck', tier: 'gold', xp: 200,
    check: (_s, a) => a.readiness >= 70,
    progress: (_s, a) => ({ value: a.readiness, target: 70 }),
  },
  {
    id: 'unit-master', name: 'Unit Master', description: 'Reach 85% readiness and master 25 concepts.', icon: 'Gem', tier: 'platinum', xp: 400,
    check: (_s, a) => a.readiness >= 85 && a.conceptsMastered >= 25,
    progress: (_s, a) => ({ value: Math.min(a.readiness, 85), target: 85 }),
  },
  {
    id: 'daily-devotee', name: 'Daily Devotee', description: 'Complete 5 daily challenges.', icon: 'Sun', tier: 'silver', xp: 100,
    check: (s) => (s.gameBests['daily-challenges']?.score ?? 0) >= 5,
    progress: (s) => ({ value: Math.min(5, s.gameBests['daily-challenges']?.score ?? 0), target: 5 }),
  },
];

export const ACHIEVEMENT_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export function checkAchievements(state: AppState, analytics: Analytics): Achievement[] {
  const unlocked: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    try {
      if (a.check(state, analytics)) unlocked.push(a);
    } catch {
      // A malformed state should never break the app.
    }
  }
  return unlocked;
}