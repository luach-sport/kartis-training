// מחיקת חשבון מלאה: כל הנתונים בענן ואז החשבון עצמו.
// גוגל פליי מחייבת אפשרות כזו בכל אפליקציה שיש בה הרשמה.
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/db.js';
import { deleteCurrentUser } from './auth-service.js';

async function deleteCollection(path) {
  const snap = await getDocs(collection(db, ...path));
  let batch = writeBatch(db);
  let count = 0;
  for (const d of snap.docs) {
    batch.delete(d.ref);
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }
  if (count % 400 !== 0) await batch.commit();
  return count;
}

// לפני הקריאה הזו צריך לאשר זהות מחדש (reauthenticate), אחרת Firebase יסרב למחוק את החשבון.
export async function deleteAccountEverywhere(uid) {
  await deleteCollection(['users', uid, 'orders']);
  await deleteCollection(['users', uid, 'devices']);
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', uid));
  await batch.commit();
  await deleteCurrentUser();
}
