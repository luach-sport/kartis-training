// "ענן" מדומה בזיכרון, לבדיקת המסכים בדפדפן בלי Firebase (npm run dev:mock).
import { SAMPLE_SHOWS, sampleStartDate } from '../../src/data/sample-shows.js';

const listeners = new Set();
export const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const db = {
  user: null,
  profiles: {},
  devices: {},
  orders: {},
  admins: new Set(),
  shows: {}
};

export function seedShows() {
  let added = 0;
  for (const s of SAMPLE_SHOWS) {
    if (db.shows[s.id]) continue;
    db.shows[s.id] = {
      id: s.id, title: s.title, artist: s.artist, venue: s.venue, city: s.city,
      startsAt: sampleStartDate(s), emoji: s.emoji, colors: s.colors, description: s.description,
      active: true, sections: structuredClone(s.sections),
      sold: Object.fromEntries(Object.keys(s.sections).map((k) => [k, 0])),
      lastSale: null, createdAt: new Date()
    };
    added++;
  }
  // כדי שיהיה מה לראות: חלק מהמקומות כבר "נמכרו"
  if (db.shows['blue-wave-tlv']) db.shows['blue-wave-tlv'].sold.vip = 24;
  if (db.shows['piano-intimate']) db.shows['piano-intimate'].sold.table = 9;
  notify();
  return added;
}

export function notify() {
  for (const fn of [...listeners]) fn();
}

export function watch(fn) {
  listeners.add(fn);
  queueMicrotask(fn);
  return () => listeners.delete(fn);
}

export function newId() {
  return Math.random().toString(36).slice(2, 12);
}

seedShows();
