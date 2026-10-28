// ההופעות: shows/{showId}. כל שינוי (כמו כרטיסים שנמכרו) מגיע לכל המכשירים בזמן אמת.
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/db.js';

const toShow = (snap) => ({ id: snap.id, ...snap.data({ serverTimestamps: 'estimate' }) });

export function watchShows(callback, onError) {
  const q = query(collection(db, 'shows'), orderBy('startsAt'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(toShow), snap.metadata.fromCache), onError);
}

export function watchShow(showId, callback, onError) {
  return onSnapshot(
    doc(db, 'shows', showId),
    (snap) => callback(snap.exists() ? toShow(snap) : null),
    onError
  );
}
