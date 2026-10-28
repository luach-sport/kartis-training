// מנגנון ההתחברות. ההתחברות נשמרת במכשיר (IndexedDB), כך שלא צריך להתחבר מחדש בכל פתיחה.
// משתמשים ב-initializeAuth ולא ב-getAuth: בתוך אפליקציית אנדרואיד getAuth טוען רכיבי דפדפן
// שלא עובדים שם ועלולים לתקוע את הטעינה.
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  connectAuthEmulator
} from 'firebase/auth';
import { app } from './app.js';
import { useEmulators, EMULATOR } from './emulator.js';

const persistence = typeof indexedDB !== 'undefined'
  ? [indexedDBLocalPersistence, browserLocalPersistence]
  : inMemoryPersistence;

export const auth = initializeAuth(app, { persistence });

// מיילים של אימות ואיפוס סיסמה יישלחו בעברית.
auth.languageCode = 'he';

if (useEmulators) {
  connectAuthEmulator(auth, EMULATOR.authUrl, { disableWarnings: true });
}
