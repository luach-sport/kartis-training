// כל מה שקשור לחשבון: הרשמה, כניסה, גוגל, איפוס סיסמה, אימות מייל, יציאה ומחיקה.
// הסיסמאות לא עוברות דרכנו בכלל — Firebase שומר אותן מוצפנות בשרת שלו.
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  reload,
  signOut as firebaseSignOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { auth } from '../firebase/auth.js';
import { googleSignIn, googleReauthenticate, googleSignOut } from './google-signin.js';
import { setPendingName } from '../core/pending-name.js';
import { normalizeEmail } from '../core/validate.js';

// ממירים את אובייקט המשתמש של Firebase לאובייקט פשוט שהמסכים משתמשים בו.
export function toAppUser(u) {
  if (!u) return null;
  const providers = (u.providerData || []).map((p) => p.providerId);
  return {
    uid: u.uid,
    email: u.email || '',
    displayName: u.displayName || '',
    emailVerified: Boolean(u.emailVerified),
    provider: providers.includes('google.com') ? 'google' : 'password',
    hasPassword: providers.includes('password')
  };
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (u) => callback(toAppUser(u)));
}

export function currentUser() {
  return toAppUser(auth.currentUser);
}

export async function registerWithEmail({ name, email, password }) {
  setPendingName(name);
  const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
  await updateProfile(cred.user, { displayName: name.trim() });
  try {
    await sendEmailVerification(cred.user);
  } catch {
    // אם השליחה נכשלה, אפשר לבקש שוב ממסך האימות
  }
  return toAppUser(auth.currentUser);
}

export async function signInWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  return toAppUser(cred.user);
}

export async function signInWithGoogle() {
  return toAppUser(await googleSignIn());
}

// מטעמי פרטיות Firebase לא מגלה אם קיים חשבון עם המייל הזה, ולכן גם המסך מציג הודעה כללית.
export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, normalizeEmail(email));
}

export async function resendVerification() {
  if (!auth.currentUser) return;
  await sendEmailVerification(auth.currentUser);
}

// טוען מחדש את מצב המשתמש (למשל אחרי שלחץ על קישור האימות במייל).
// אחרי אימות מבקשים אסימון חדש, כדי שגם כללי האבטחה בשרת ידעו שהמייל מאומת.
export async function refreshUser() {
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  if (auth.currentUser.emailVerified) await auth.currentUser.getIdToken(true);
  return toAppUser(auth.currentUser);
}

// אישור זהות מחדש לפני פעולות רגישות (מחיקת חשבון).
export async function reauthenticate({ password } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('not signed in');
  const app = toAppUser(user);
  if (app.hasPassword && password) {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    return;
  }
  await googleReauthenticate(user);
}

export async function signOut() {
  await googleSignOut();
  await firebaseSignOut(auth);
}

export async function deleteCurrentUser() {
  if (!auth.currentUser) return;
  await deleteUser(auth.currentUser);
  await googleSignOut();
}
