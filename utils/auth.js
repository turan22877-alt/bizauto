import { CURRENCY_SYMBOLS } from '../types';

const USERS_KEY = 'b_users';
const SESSION_KEY = 'b_session';
const SECURITY_KEY = 'b_security';
const SALT_PREFIX = 'selliz_v1';

// Security constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove < >
    .trim()
    .slice(0, 500); // Limit length
}

// Generate cryptographically secure random ID
function generateSecureId() {
  return crypto.randomUUID();
}

// Security state management
function readSecurityState() {
  try {
    const raw = localStorage.getItem(SECURITY_KEY);
    if (!raw) return { attempts: {}, locked: {} };
    return JSON.parse(raw);
  } catch {
    return { attempts: {}, locked: {} };
  }
}

function writeSecurityState(state) {
  try {
    localStorage.setItem(SECURITY_KEY, JSON.stringify(state));
  } catch {
    // Silent fail - security state is not critical
  }
}

// Check if IP/email is locked out
function isLockedOut(identifier) {
  const state = readSecurityState();
  const lockout = state.locked[identifier];
  if (!lockout) return false;

  if (Date.now() > lockout.expiresAt) {
    // Lockout expired, clear it
    delete state.locked[identifier];
    writeSecurityState(state);
    return false;
  }

  return true;
}

// Record failed attempt
function recordFailedAttempt(identifier) {
  const state = readSecurityState();

  if (!state.attempts[identifier]) {
    state.attempts[identifier] = { count: 0, lastAttempt: Date.now() };
  }

  state.attempts[identifier].count++;
  state.attempts[identifier].lastAttempt = Date.now();

  // Lockout if max attempts reached
  if (state.attempts[identifier].count >= MAX_LOGIN_ATTEMPTS) {
    state.locked[identifier] = {
      lockedAt: Date.now(),
      expiresAt: Date.now() + LOCKOUT_DURATION_MS,
      attempts: state.attempts[identifier].count,
    };
    delete state.attempts[identifier];
  }

  writeSecurityState(state);
}

// Clear attempts on successful login
function clearAttempts(identifier) {
  const state = readSecurityState();
  delete state.attempts[identifier];
  delete state.locked[identifier];
  writeSecurityState(state);
}

export function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Generate secure salt
function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashCredential(email, password, salt = null) {
  const userSalt = salt || generateSalt();
  const enc = new TextEncoder().encode(
    `${SALT_PREFIX}:${userSalt}:${email.trim().toLowerCase()}::${password}`
  );
  const buf = await crypto.subtle.digest('SHA-256', enc);
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { hash, salt: userSalt };
}

export function sessionToProfile(u) {
  return {
    uid: u.uid,
    email: u.email,
    displayName: sanitizeInput(u.displayName),
    role: 'master',
    businessName: u.businessName ? sanitizeInput(u.businessName) : null,
    currency: u.currency || 'RUB',
    createdAt: u.createdAt,
    lastActive: Date.now(),
    sessionId: u.sessionId || generateSecureId(),
  };
}

// Validate session is not expired
export function validateSession(session) {
  if (!session) return null;

  const now = Date.now();

  // Check if session is too old
  if (session.lastActive && (now - session.lastActive) > SESSION_TIMEOUT_MS) {
    logoutUser();
    return null;
  }

  // Refresh session timestamp
  if (session.lastActive && (now - session.lastActive) > TOKEN_REFRESH_INTERVAL_MS) {
    const refreshed = { ...session, lastActive: now };
    setSession(refreshed);
    return refreshed;
  }

  return session;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return validateSession(session);
  } catch {
    return null;
  }
}

export function setSession(profile) {
  if (!profile) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    const enriched = { ...profile, lastActive: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(enriched));
  }
}

// Validation helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return { ok: false, error: 'Пароль должен содержать минимум 8 символов.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, error: 'Пароль должен содержать хотя бы одну заглавную букву.' };
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, error: 'Пароль должен содержать хотя бы одну строчную букву.' };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, error: 'Пароль должен содержать хотя бы одну цифру.' };
  }
  return { ok: true };
}

export async function registerUser(
  email,
  password,
  displayName,
  businessName
) {
  // Input sanitization
  const normalized = sanitizeInput(email).toLowerCase();
  const sanitizedDisplayName = sanitizeInput(displayName);
  const sanitizedBusinessName = businessName ? sanitizeInput(businessName) : undefined;

  // Validation
  if (!normalized || !validateEmail(normalized)) {
    return { ok: false, error: 'Введите корректный email адрес.' };
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    return passwordCheck;
  }

  if (!sanitizedDisplayName || sanitizedDisplayName.length < 2) {
    return { ok: false, error: 'Введите имя (минимум 2 символа).' };
  }

  // Check if user exists
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'Аккаунт с таким email уже существует.' };
  }

  // Create user with salt
  const uid = generateSecureId();
  const { hash: passwordHash, salt } = await hashCredential(normalized, password);

  const row = {
    uid,
    email: normalized,
    passwordHash,
    salt,
    displayName: sanitizedDisplayName || 'Пользователь',
    businessName: sanitizedBusinessName || undefined,
    createdAt: Date.now(),
    lastLogin: Date.now(),
    loginCount: 0,
  };

  writeUsers([...users, row]);

  const profile = sessionToProfile(row);
  setSession(profile);

  return { ok: true, profile };
}

export async function loginUser(
  email,
  password
) {
  const normalized = sanitizeInput(email).toLowerCase();

  // Check lockout
  if (isLockedOut(normalized)) {
    return {
      ok: false,
      error: `Слишком много неудачных попыток. Попробуйте позже.`,
      locked: true,
    };
  }

  // Validation
  if (!normalized || !validateEmail(normalized)) {
    return { ok: false, error: 'Введите корректный email адрес.' };
  }

  if (!password || password.length < 1) {
    return { ok: false, error: 'Введите пароль.' };
  }

  const users = readUsers();
  const row = users.find((u) => u.email.toLowerCase() === normalized);

  if (!row) {
    recordFailedAttempt(normalized);
    return { ok: false, error: 'Неверный email или пароль.' };
  }

  // Verify password with stored salt
  const { hash: computedHash } = await hashCredential(normalized, password, row.salt);

  if (computedHash !== row.passwordHash) {
    recordFailedAttempt(normalized);
    return { ok: false, error: 'Неверный email или пароль.' };
  }

  // Success - clear attempts
  clearAttempts(normalized);

  // Update user stats
  const updatedUsers = users.map(u =>
    u.uid === row.uid
      ? { ...u, lastLogin: Date.now(), loginCount: (u.loginCount || 0) + 1 }
      : u
  );
  writeUsers(updatedUsers);

  // Add session ID for extra security
  const sessionId = generateSecureId();
  const sessionRow = { ...row, sessionId };

  const profile = sessionToProfile(sessionRow);
  setSession(profile);

  return { ok: true, profile };
}

export function logoutUser() {
  setSession(null);
}

export function updateUserProfile(
  uid,
  patch
) {
  const users = readUsers();
  const i = users.findIndex((u) => u.uid === uid);
  if (i === -1) return null;

  const row = { ...users[i] };

  if (patch.displayName !== undefined) {
    const sanitized = sanitizeInput(patch.displayName);
    row.displayName = sanitized || row.displayName;
  }

  if (patch.businessName !== undefined) {
    const sanitized = patch.businessName ? sanitizeInput(patch.businessName) : null;
    row.businessName = sanitized || undefined;
  }

  if (patch.currency !== undefined) {
    if (CURRENCY_SYMBOLS[patch.currency]) {
      row.currency = patch.currency;
    }
  }

  users[i] = row;
  writeUsers(users);

  const profile = sessionToProfile(row);

  // Update active session if this is current user
  const currentSession = getSession();
  if (currentSession && currentSession.uid === uid) {
    setSession(profile);
  }

  return profile;
}

// Change password with current password verification
export async function changePassword(uid, currentPassword, newPassword) {
  const users = readUsers();
  const user = users.find((u) => u.uid === uid);

  if (!user) {
    return { ok: false, error: 'Пользователь не найден.' };
  }

  // Verify current password
  const { hash: currentHash } = await hashCredential(user.email, currentPassword, user.salt);
  if (currentHash !== user.passwordHash) {
    return { ok: false, error: 'Текущий пароль неверный.' };
  }

  // Validate new password
  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.ok) {
    return passwordCheck;
  }

  // Hash new password with new salt
  const { hash: newHash, salt: newSalt } = await hashCredential(user.email, newPassword);

  // Update user
  const updatedUsers = users.map(u =>
    u.uid === uid
      ? { ...u, passwordHash: newHash, salt: newSalt }
      : u
  );
  writeUsers(updatedUsers);

  return { ok: true };
}

// Check session validity periodically
export function initSessionCheck() {
  const checkInterval = setInterval(() => {
    const session = getSession();
    if (!session) {
      clearInterval(checkInterval);
      window.location.reload();
    }
  }, 60000); // Check every minute

  return () => clearInterval(checkInterval);
}

// Cleanup old security data on startup
export function cleanupSecurityData() {
  const state = readSecurityState();
  const now = Date.now();

  // Clean expired lockouts
  Object.entries(state.locked).forEach(([key, lockout]) => {
    if (now > lockout.expiresAt) {
      delete state.locked[key];
    }
  });

  // Clean old attempts (older than 24 hours)
  Object.entries(state.attempts).forEach(([key, attempt]) => {
    if (now - attempt.lastAttempt > 24 * 60 * 60 * 1000) {
      delete state.attempts[key];
    }
  });

  writeSecurityState(state);
}

// Initialize cleanup on load
if (typeof window !== 'undefined') {
  cleanupSecurityData();
}
