// התחברות עם גוגל.
// באנדרואיד: חלון בחירת החשבון של המערכת (Credential Manager) נותן אסימון זהות,
// ואיתו מתחברים ל-Firebase. גוגל חוסמת התחברות דרך דפדפן מוטמע, ולכן אי אפשר לעשות זאת ב-JS בלבד.
// בדפדפן (לבדיקות): חלון קופץ רגיל של גוגל.
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '../firebase/auth.js';
import { isNative } from '../core/platform.js';
import { appError } from '../core/errors.js';

async function nativeGoogleCredential() {
  const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
  const idToken = result?.credential?.idToken;
  if (!idToken) throw appError('app/cancelled');
  return GoogleAuthProvider.credential(idToken);
}

function webProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export async function googleSignIn() {
  if (isNative()) {
    const cred = await signInWithCredential(auth, await nativeGoogleCredential());
    return cred.user;
  }
  const cred = await signInWithPopup(auth, webProvider(), browserPopupRedirectResolver);
  return cred.user;
}

export async function googleReauthenticate(user) {
  if (isNative()) return reauthenticateWithCredential(user, await nativeGoogleCredential());
  return reauthenticateWithPopup(user, webProvider(), browserPopupRedirectResolver);
}

// מנקה את בחירת החשבון בטלפון, כדי שבפעם הבאה אפשר יהיה לבחור חשבון גוגל אחר.
export async function googleSignOut() {
  if (!isNative()) return;
  try {
    await FirebaseAuthentication.signOut();
  } catch {
    // לא קריטי
  }
}
