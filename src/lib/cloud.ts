import type { Firestore, DocumentData } from 'firebase/firestore';

export type Board = 'karting' | 'exam' | 'mastery' | 'xp';
export interface CloudProfile { id: string; username: string; name: string; avatar: string; createdAt: number }
export interface LeaderRow { id: string; name: string; score: number; accuracy: number; updatedAt: number; avatar?: string }

const FIREBASE_CONFIG = {
  projectId: 'trophic-ecology-2026',
  appId: '1:48465700279:web:75dc041359018451d6f432',
  storageBucket: 'trophic-ecology-2026.firebasestorage.app',
  apiKey: 'AIzaSyAy-pT9X8B1DivxhkThc3EzUkUHOg7I8Hk',
  authDomain: 'trophic-ecology-2026.firebaseapp.com',
  messagingSenderId: '48465700279',
  projectNumber: '48465700279',
};

let sdkPromise: Promise<{ db: Firestore; fns: typeof import('firebase/firestore') }> | null = null;

async function getSdk() {
  if (!sdkPromise) {
    sdkPromise = Promise.all([import('firebase/app'), import('firebase/firestore')]).then(([appMod, fns]) => {
      const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(FIREBASE_CONFIG, 'trophic-cloud');
      const db = fns.getFirestore(app, 'default');
      return { db, fns };
    });
  }
  return sdkPromise;
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

export function validateAccountInput(username: string, password: string) {
  if (normalizeUsername(username).length < 3) return 'Username must be at least 3 characters.';
  if (normalizeUsername(username).length > 24) return 'Username must be 24 characters or fewer.';
  if (!/^[a-z0-9_.-]+$/.test(normalizeUsername(username))) return 'Use letters, numbers, dot, dash or underscore.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export async function accountIdFor(username: string, password: string) {
  const input = `TROPHIC|v1|${normalizeUsername(username)}|${password}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function avatarFor(name: string) {
  const colors = ['#b7f34a', '#4de1c1', '#7dd3fc', '#a78bfa', '#ffc24b', '#f472b6', '#ff8a65'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}

export async function createCloudAccount(username: string, password: string, displayName: string): Promise<{ profile?: CloudProfile; error?: string }> {
  const invalid = validateAccountInput(username, password);
  if (invalid) return { error: invalid };
  if (displayName.trim().length < 1) return { error: 'Choose a display name.' };
  if (displayName.trim().length > 24) return { error: 'Display name must be 24 characters or fewer.' };
  try {
    const { db, fns } = await getSdk();
    const id = await accountIdFor(username, password);
    const ref = fns.doc(db, 'accounts', id);
    const unameRef = fns.doc(db, 'usernames', normalizeUsername(username));
    const profile: CloudProfile = { id, username: normalizeUsername(username), name: displayName.trim(), avatar: avatarFor(displayName.trim()), createdAt: Date.now() };
    const outcome = await fns.runTransaction(db, async (tx) => {
      const [nameSnap, accountSnap] = [await tx.get(unameRef), await tx.get(ref)];
      if (nameSnap.exists() || accountSnap.exists()) return { taken: true as const };
      tx.set(unameRef, { accountId: id, name: profile.name, createdAt: profile.createdAt });
      tx.set(ref, { ...profile, accountId: id });
      return { taken: false as const };
    });
    if (outcome.taken) return { error: 'That username is already taken. Try signing in or pick another.' };
    return { profile };
  } catch (e) {
    return { error: e instanceof Error ? `Cloud account failed: ${e.message}` : 'Cloud account failed. Check your connection.' };
  }
}

export async function signInCloud(username: string, password: string): Promise<{ profile?: CloudProfile; error?: string }> {
  if (!username || !password) return { error: 'Enter your username and password.' };
  try {
    const { db, fns } = await getSdk();
    const id = await accountIdFor(username, password);
    const snap = await fns.getDoc(fns.doc(db, 'accounts', id));
    if (!snap.exists()) return { error: 'No account matches that username and password.' };
    const data = snap.data() as CloudProfile;
    return { profile: { ...data, id } };
  } catch (e) {
    return { error: e instanceof Error ? `Sign-in failed: ${e.message}` : 'Sign-in failed. Check your connection.' };
  }
}

export async function submitScore(board: Board, profile: CloudProfile, score: number, accuracy: number) {
  try {
    const { db, fns } = await getSdk();
    const safeScore = Math.max(0, Math.min(10_000_000, Math.round(score)));
    const safeAccuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
    const ref = fns.doc(db, `leaderboard_${board}`, profile.id);
    const existing = await fns.getDoc(ref);
    if (existing.exists() && Number(existing.data().score ?? 0) >= safeScore) return { ok: true };
    await fns.setDoc(ref, {
      accountId: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      score: safeScore,
      accuracy: safeAccuracy,
      updatedAt: Date.now(),
    }, { merge: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Leaderboard write failed.' };
  }
}

export async function fetchLeaderboard(board: Board, limit = 25): Promise<{ rows?: LeaderRow[]; error?: string }> {
  try {
    const { db, fns } = await getSdk();
    const q = fns.query(fns.collection(db, `leaderboard_${board}`), fns.orderBy('score', 'desc'), fns.limit(limit));
    const snap = await fns.getDocs(q);
    const rows: LeaderRow[] = snap.docs.map((d) => {
      const data = d.data() as DocumentData;
      return { id: d.id, name: String(data.name ?? 'Unknown'), score: Number(data.score ?? 0), accuracy: Number(data.accuracy ?? 0), updatedAt: Number(data.updatedAt ?? 0), avatar: String(data.avatar ?? '#b7f34a') };
    });
    return { rows };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not load the leaderboard.' };
  }
}

export async function saveCloudProgress(profile: CloudProfile, state: unknown) {
  try {
    const { db, fns } = await getSdk();
    const data = JSON.stringify(state);
    if (data.length > 900_000) return { ok: false, error: 'Progress is too large for one cloud save. Export a local backup instead.' };
    await fns.setDoc(fns.doc(db, 'saves', profile.id), { accountId: profile.id, data, updatedAt: Date.now() }, { merge: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Cloud save failed.' };
  }
}

export async function loadCloudProgress(profile: CloudProfile) {
  try {
    const { db, fns } = await getSdk();
    const snap = await fns.getDoc(fns.doc(db, 'saves', profile.id));
    if (!snap.exists()) return { error: 'No cloud save exists for this account yet.' };
    const data = snap.data();
    return { data: String(data.data ?? '') };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Cloud restore failed.' };
  }
}

export const CLOUD_PROFILE_KEY = 'trophic-cloud-profile-v1';
export function loadStoredProfile(): CloudProfile | null {
  try {
    const raw = localStorage.getItem(CLOUD_PROFILE_KEY);
    const p = raw ? JSON.parse(raw) as CloudProfile : null;
    return p && typeof p.id === 'string' && p.id.length === 64 ? p : null;
  } catch { return null; }
}
export function storeProfile(profile: CloudProfile | null) {
  try { if (profile) localStorage.setItem(CLOUD_PROFILE_KEY, JSON.stringify(profile)); else localStorage.removeItem(CLOUD_PROFILE_KEY); } catch { /* ignore */ }
}