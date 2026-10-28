import { db, watch } from './mock-db.js';

const clone = (s) => structuredClone(s);

export function watchShows(callback) {
  return watch(() => callback(Object.values(db.shows).map(clone).sort((a, b) => a.startsAt - b.startsAt), false));
}

export function watchShow(showId, callback) {
  return watch(() => callback(db.shows[showId] ? clone(db.shows[showId]) : null));
}
