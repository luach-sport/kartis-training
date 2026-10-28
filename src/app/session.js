// מחבר בין ההתחברות לשאר האפליקציה: כשמשתמש נכנס — טוענים פרופיל, בודקים אם הוא מנהל,
// רושמים את המכשיר בחשבון ומאזינים אם ניתקו אותו ממכשיר אחר.
import { onAuthChange, signOut, refreshUser } from '@services/auth-service.js';
import { ensureProfile, watchProfile } from '@services/profile-service.js';
import { registerThisDevice, watchThisDevice, removeDevice, thisDeviceId } from '@services/devices-service.js';
import { watchIsAdmin } from '@services/admin-service.js';
import { getState, setState } from '../core/store.js';
import { toast } from '../core/toast.js';

let stops = [];
let leaving = false;

function stopAll() {
  for (const stop of stops) {
    try { stop?.(); } catch { /* כבר נסגר */ }
  }
  stops = [];
}

async function onSignedIn(user) {
  stops.push(watchProfile(user.uid, (profile) => setState({ profile }), () => {}));
  stops.push(watchIsAdmin(user.uid, (isAdmin) => setState({ isAdmin })));

  try { await ensureProfile(user); } catch (e) { console.warn('[kartis] profile', e); }
  try { await registerThisDevice(user.uid); } catch (e) { console.warn('[kartis] device', e); }

  let seen = false;
  stops.push(watchThisDevice(user.uid, (exists, fromCache) => {
    if (exists) { seen = true; return; }
    if (seen && !fromCache && !leaving) signOutHere('נותקת מהמכשיר הזה דרך מכשיר אחר.');
  }));
}

export function startSession() {
  onAuthChange((user) => {
    stopAll();
    leaving = false;
    setState({ ready: true, user, profile: null, isAdmin: false });
    if (user) onSignedIn(user);
  });
}

const timeout = (ms) => new Promise((r) => setTimeout(r, ms));

// יציאה מהמכשיר הזה: מורידים אותו מרשימת המכשירים ואז מתנתקים.
export async function signOutHere(message) {
  if (leaving) return;
  leaving = true;
  const { user } = getState();
  stopAll();
  if (user) await Promise.race([removeDevice(user.uid, thisDeviceId()).catch(() => {}), timeout(3000)]);
  await signOut();
  if (message) toast(message, 'info', 5000);
}

// לפני מחיקת חשבון: שהמחיקה של רשומת המכשיר לא תיראה כמו "ניתוק ממכשיר אחר".
export function prepareForAccountDeletion() {
  leaving = true;
  stopAll();
}

// אחרי אימות מייל: מעדכנים את המצב בלי להתנתק.
export async function reloadUser() {
  const user = await refreshUser();
  if (user) setState({ user });
  return user;
}
