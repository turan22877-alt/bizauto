import { UserProfile, Currency } from '../types';

const USERS_KEY = 'b_users';
const SESSION_KEY = 'b_session';

export type StoredUser = {
  uid: string;
  email: string;
  passwordHash: string;
  displayName: string;
  businessName?: string;
  currency?: Currency;
  createdAt: number;
};

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function hashCredential(email: string, password: string): Promise<string> {
  const enc = new TextEncoder().encode(`${email.trim().toLowerCase()}::${password}`);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function sessionToProfile(u: StoredUser): UserProfile {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    role: 'master',
    businessName: u.businessName,
    currency: u.currency || 'RUB',
    createdAt: u.createdAt,
  };
}

export function getSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setSession(profile: UserProfile | null) {
  if (!profile) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  businessName?: string
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password || password.length < 6) {
    return { ok: false, error: 'Пароль не короче 6 символов и email обязателен.' };
  }
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'Аккаунт с таким email уже есть.' };
  }
  const uid = crypto.randomUUID();
  const passwordHash = await hashCredential(normalized, password);
  const row: StoredUser = {
    uid,
    email: normalized,
    passwordHash,
    displayName: displayName.trim() || 'Пользователь',
    businessName: businessName?.trim() || undefined,
    createdAt: Date.now(),
  };
  writeUsers([...users, row]);
  const profile = sessionToProfile(row);
  setSession(profile);
  return { ok: true, profile };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  const row = users.find((u) => u.email.toLowerCase() === normalized);
  if (!row) return { ok: false, error: 'Неверный email или пароль.' };
  const h = await hashCredential(normalized, password);
  if (h !== row.passwordHash) return { ok: false, error: 'Неверный email или пароль.' };
  const profile = sessionToProfile(row);
  setSession(profile);
  return { ok: true, profile };
}

export function logoutUser() {
  setSession(null);
}

export function updateUserProfile(
  uid: string,
  patch: { displayName?: string; businessName?: string | null; currency?: Currency }
): UserProfile | null {
  const users = readUsers();
  const i = users.findIndex((u) => u.uid === uid);
  if (i === -1) return null;
  const row = { ...users[i] };
  if (patch.displayName !== undefined) row.displayName = patch.displayName.trim() || row.displayName;
  if (patch.businessName !== undefined) {
    const b = patch.businessName?.trim();
    row.businessName = b || undefined;
  }
  if (patch.currency !== undefined) {
    row.currency = patch.currency;
  }
  users[i] = row;
  writeUsers(users);
  const profile = sessionToProfile(row);
  setSession(profile);
  return profile;
}
