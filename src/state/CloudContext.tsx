import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStudy } from './StudyContext';
import {
  CLOUD_PROFILE_KEY,
  createCloudAccount,
  fetchLeaderboard,
  loadCloudProgress,
  loadStoredProfile,
  saveCloudProgress,
  signInCloud,
  storeProfile,
  submitScore,
  type Board,
  type CloudProfile,
  type LeaderRow,
} from '../lib/cloud';

interface CloudContextValue {
  profile: CloudProfile | null;
  loading: boolean;
  error: string;
  signUp: (username: string, password: string, name: string) => Promise<boolean>;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
  saveProgress: () => Promise<{ ok: boolean; error?: string }>;
  restoreProgress: () => Promise<{ ok: boolean; error?: string }>;
  publishStats: () => Promise<{ ok: boolean; error?: string }>;
  submitKarting: (score: number, accuracy: number) => Promise<void>;
  submitExam: (score: number, accuracy: number) => Promise<void>;
  getBoard: (board: Board) => Promise<{ rows?: LeaderRow[]; error?: string }>;
  clearError: () => void;
}

const CloudContext = createContext<CloudContextValue | null>(null);

export function CloudProvider({ children }: { children: React.ReactNode }) {
  const { state, analytics, importBackup } = useStudy();
  const [profile, setProfile] = useState<CloudProfile | null>(() => loadStoredProfile());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    storeProfile(profile);
  }, [profile]);

  const applyProfile = useCallback((p: CloudProfile) => {
    setProfile(p);
    storeProfile(p);
    setError('');
  }, []);

  const signUp = useCallback(async (username: string, password: string, name: string) => {
    setLoading(true); setError('');
    const res = await createCloudAccount(username, password, name);
    setLoading(false);
    if (res.error) { setError(res.error); return false; }
    if (res.profile) applyProfile(res.profile);
    return true;
  }, [applyProfile]);

  const signIn = useCallback(async (username: string, password: string) => {
    setLoading(true); setError('');
    const res = await signInCloud(username, password);
    setLoading(false);
    if (res.error) { setError(res.error); return false; }
    if (res.profile) applyProfile(res.profile);
    return true;
  }, [applyProfile]);

  const signOut = useCallback(() => { setProfile(null); storeProfile(null); setError(''); }, []);
  const clearError = useCallback(() => setError(''), []);

  const saveProgress = useCallback(async () => {
    if (!profile) return { ok: false, error: 'Sign in to save to the cloud.' };
    setLoading(true);
    const res = await saveCloudProgress(profile, state);
    setLoading(false);
    if (!res.ok) setError(res.error ?? 'Cloud save failed.');
    return res;
  }, [profile, state]);

  const restoreProgress = useCallback(async () => {
    if (!profile) return { ok: false, error: 'Sign in to restore from the cloud.' };
    setLoading(true);
    const res = await loadCloudProgress(profile);
    setLoading(false);
    if (res.error || !res.data) { setError(res.error ?? 'No cloud save found.'); return { ok: false, error: res.error }; }
    const imported = importBackup(res.data);
    if (!imported.ok) { setError(imported.error ?? 'Cloud save is invalid.'); return { ok: false, error: imported.error }; }
    return { ok: true };
  }, [importBackup, profile]);

  const submitKarting = useCallback(async (score: number, accuracy: number) => {
    if (!profile) return;
    await submitScore('karting', profile, score, accuracy);
  }, [profile]);

  const submitExam = useCallback(async (score: number, accuracy: number) => {
    if (!profile) return;
    await submitScore('exam', profile, score, accuracy);
  }, [profile]);

  const publishStats = useCallback(async () => {
    if (!profile) return { ok: false, error: 'Sign in to publish scores.' };
    setLoading(true);
    const results = await Promise.all([
      submitScore('mastery', profile, analytics.readiness, analytics.correctPct),
      submitScore('xp', profile, state.xp, analytics.correctPct),
      state.gameBests.karting ? submitScore('karting', profile, state.gameBests.karting.score, state.gameBests.karting.accuracy) : Promise.resolve({ ok: true }),
      state.exams[0] ? submitScore('exam', profile, Math.round((state.exams[0].totalEarned / Math.max(1, state.exams[0].totalPoints)) * 100), Math.round((state.exams[0].totalEarned / Math.max(1, state.exams[0].totalPoints)) * 100)) : Promise.resolve({ ok: true }),
    ]);
    setLoading(false);
    if (results.some((r) => !r.ok)) { setError('Some scores could not be published. Try again.'); return { ok: false }; }
    return { ok: true };
  }, [analytics.correctPct, analytics.readiness, profile, state.exams, state.gameBests.karting, state.xp]);

  const getBoard = useCallback((board: Board) => fetchLeaderboard(board), []);
  const value = useMemo<CloudContextValue>(() => ({ profile, loading, error, signUp, signIn, signOut, saveProgress, restoreProgress, publishStats, submitKarting, submitExam, getBoard, clearError }), [profile, loading, error, signUp, signIn, signOut, saveProgress, restoreProgress, publishStats, submitKarting, submitExam, getBoard, clearError]);
  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloud() {
  const ctx = useContext(CloudContext);
  if (!ctx) throw new Error('useCloud must be used inside CloudProvider');
  return ctx;
}

export { CLOUD_PROFILE_KEY };