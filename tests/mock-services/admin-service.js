import { db, delay, notify, watch, seedShows } from './mock-db.js';

export function watchIsAdmin(uid, callback) {
  return watch(() => callback(db.admins.has(uid)));
}

export async function seedSampleShows() {
  await delay(300);
  return seedShows();
}

export async function setShowActive(showId, active) {
  await delay(200);
  db.shows[showId].active = active;
  notify();
}
