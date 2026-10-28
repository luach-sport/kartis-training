// גרסה מדומה של auth-service — אותן פונקציות, בלי שרת.
import { db, delay, notify } from './mock-db.js';
import { AppError } from '../../src/core/errors.js';
import { setPendingName } from '../../src/core/pending-name.js';

const authListeners = new Set();
const emit = () => { for (const fn of authListeners) fn(db.user ? { ...db.user } : null); notify(); };

export function toAppUser(u) { return u; }

export function onAuthChange(callback) {
  authListeners.add(callback);
  setTimeout(() => callback(db.user ? { ...db.user } : null), 150);
  return () => authListeners.delete(callback);
}

export const currentUser = () => (db.user ? { ...db.user } : null);

function makeUser(email, name, provider, verified) {
  return { uid: 'demo-' + email.split('@')[0], email, displayName: name, emailVerified: verified, provider, hasPassword: provider === 'password' };
}

export async function registerWithEmail({ name, email }) {
  await delay(400);
  setPendingName(name);
  db.user = makeUser(email, name, 'password', false);
  emit();
  return { ...db.user };
}

export async function signInWithEmail(email, password) {
  await delay(400);
  if (password === 'wrong') throw new AppError('auth/invalid-credential');
  db.user = makeUser(email, email.split('@')[0], 'password', true);
  emit();
  return { ...db.user };
}

export async function signInWithGoogle() {
  await delay(400);
  db.user = makeUser('demo.user@gmail.com', 'ישראל ישראלי', 'google', true);
  db.admins.add(db.user.uid);
  emit();
  return { ...db.user };
}

export async function sendPasswordReset() { await delay(400); }
export async function resendVerification() { await delay(300); }

export async function refreshUser() {
  await delay(300);
  if (db.user) db.user.emailVerified = true;
  return db.user ? { ...db.user } : null;
}

export async function reauthenticate() { await delay(300); }

export async function signOut() {
  await delay(150);
  db.user = null;
  emit();
}

export async function deleteCurrentUser() {
  db.user = null;
  emit();
}
