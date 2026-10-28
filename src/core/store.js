// המצב הכללי של האפליקציה (מי מחובר, הפרופיל, האם מנהל) עם הרשמה לשינויים.

const state = {
  ready: false,      // האם כבר ידוע אם יש משתמש מחובר
  user: null,        // { uid, email, displayName, emailVerified, provider }
  profile: null,     // המסמך users/{uid}
  isAdmin: false,
  online: true
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  for (const fn of [...listeners]) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// השם שמוצג למשתמש: מהפרופיל, מהחשבון, או מתחילת המייל.
export function displayName() {
  return state.profile?.displayName || state.user?.displayName || (state.user?.email || '').split('@')[0] || '';
}
