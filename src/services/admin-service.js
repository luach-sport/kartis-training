// כלים למנהל: טעינת הופעות לדוגמה, פתיחה וסגירה של מכירה.
// מי מנהל נקבע רק בקונסולה של Firebase (admins/{uid}); כללי האבטחה בודקים את זה בשרת.
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/db.js';
import { SAMPLE_SHOWS, sampleStartDate } from '../data/sample-shows.js';

export function watchIsAdmin(uid, callback) {
  return onSnapshot(
    doc(db, 'admins', uid),
    (snap) => callback(snap.exists()),
    () => callback(false)
  );
}

export function buildShowDoc(sample, now = new Date()) {
  const sold = Object.fromEntries(Object.keys(sample.sections).map((k) => [k, 0]));
  return {
    title: sample.title,
    artist: sample.artist,
    venue: sample.venue,
    city: sample.city,
    startsAt: Timestamp.fromDate(sampleStartDate(sample, now)),
    emoji: sample.emoji,
    colors: sample.colors,
    description: sample.description,
    active: true,
    sections: sample.sections,
    sold,
    lastSale: null,
    createdAt: serverTimestamp()
  };
}

// מוסיף רק הופעות שעוד לא קיימות. מחזיר כמה נוספו.
export async function seedSampleShows() {
  let added = 0;
  for (const sample of SAMPLE_SHOWS) {
    const ref = doc(db, 'shows', sample.id);
    const snap = await getDoc(ref);
    if (snap.exists()) continue;
    await setDoc(ref, buildShowDoc(sample));
    added++;
  }
  return added;
}

export async function setShowActive(showId, active) {
  await updateDoc(doc(db, 'shows', showId), { active });
}
