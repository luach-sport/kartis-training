// הפרופיל של המשתמש בענן: users/{uid}
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/db.js';
import { takePendingName } from '../core/pending-name.js';
import { isOnline } from '../core/net-status.js';

const profileRef = (uid) => doc(db, 'users', uid);

// נוצר פעם אחת, בכניסה הראשונה לחשבון (מכל מכשיר שהוא).
export async function ensureProfile(user) {
  const ref = profileRef(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const name = takePendingName() || user.displayName || user.email.split('@')[0] || 'משתמש';
  const profile = {
    displayName: name.slice(0, 60),
    email: user.email || null,
    phone: '',
    city: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, profile);
  return profile;
}

export function watchProfile(uid, callback, onError) {
  return onSnapshot(
    profileRef(uid),
    (snap) => callback(snap.exists() ? snap.data({ serverTimestamps: 'estimate' }) : null),
    onError
  );
}

// בלי חיבור השינוי נשמר במכשיר ונשלח לענן לבד כשהחיבור חוזר.
export async function saveProfile(uid, { displayName, phone, city }) {
  const write = updateDoc(profileRef(uid), {
    displayName: displayName.trim(),
    phone: phone || '',
    city: (city || '').trim(),
    updatedAt: serverTimestamp()
  });
  if (!isOnline()) {
    write.catch(() => {});
    return 'queued';
  }
  await write;
  return 'saved';
}
