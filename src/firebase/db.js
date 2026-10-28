// מסד הנתונים בענן (Firestore).
// persistentLocalCache = עותק מקומי במכשיר: הכרטיסים נראים גם בלי אינטרנט,
// ושינויים שנעשו בלי חיבור נשלחים לבד כשהחיבור חוזר.
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  memoryLocalCache,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { app } from './app.js';
import { useEmulators, EMULATOR } from './emulator.js';

const canPersist = typeof indexedDB !== 'undefined' && !useEmulators;

export const db = initializeFirestore(app, {
  localCache: canPersist
    ? persistentLocalCache({ tabManager: persistentSingleTabManager() })
    : memoryLocalCache()
});

if (useEmulators) {
  connectFirestoreEmulator(db, EMULATOR.firestoreHost, EMULATOR.firestorePort);
}
