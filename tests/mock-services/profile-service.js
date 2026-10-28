import { db, delay, notify, watch } from './mock-db.js';
import { takePendingName } from '../../src/core/pending-name.js';

export async function ensureProfile(user) {
  await delay();
  if (!db.profiles[user.uid]) {
    db.profiles[user.uid] = {
      displayName: takePendingName() || user.displayName || user.email.split('@')[0],
      email: user.email, phone: '', city: '', createdAt: new Date(), updatedAt: new Date()
    };
    notify();
  }
  return db.profiles[user.uid];
}

export function watchProfile(uid, callback) {
  return watch(() => callback(db.profiles[uid] ? { ...db.profiles[uid] } : null));
}

export async function saveProfile(uid, data) {
  await delay(300);
  Object.assign(db.profiles[uid], data, { updatedAt: new Date() });
  notify();
  return 'saved';
}
