// חישובי מלאי של הופעה: כמה כרטיסים נשארו, האם אזל, האם ההופעה עברה.
import { toDate } from './format.js';
import { MAX_TICKETS_PER_ORDER } from '../config/app-config.js';

export function sectionKeys(show) {
  // מסודר לפי מחיר, מהזול ליקר.
  return Object.keys(show?.sections || {})
    .sort((a, b) => (show.sections[a].price || 0) - (show.sections[b].price || 0));
}

export function remaining(show, key) {
  const sec = show?.sections?.[key];
  if (!sec) return 0;
  return Math.max(0, (sec.capacity || 0) - (show.sold?.[key] || 0));
}

export function totalRemaining(show) {
  return sectionKeys(show).reduce((sum, key) => sum + remaining(show, key), 0);
}

export function totalCapacity(show) {
  return sectionKeys(show).reduce((sum, key) => sum + (show.sections[key].capacity || 0), 0);
}

export function lowestPrice(show) {
  const prices = sectionKeys(show).map((k) => show.sections[k].price || 0);
  return prices.length ? Math.min(...prices) : 0;
}

export function isPast(show, now = Date.now()) {
  const d = toDate(show?.startsAt);
  return Boolean(d && d.getTime() <= now);
}

export function isSoldOut(show) {
  return totalRemaining(show) === 0;
}

// מצב ההופעה לתצוגה: open / low / soldout / closed / past
export function showStatus(show, now = Date.now()) {
  if (isPast(show, now)) return 'past';
  if (!show?.active) return 'closed';
  const left = totalRemaining(show);
  if (left === 0) return 'soldout';
  if (left <= Math.max(10, totalCapacity(show) * 0.1)) return 'low';
  return 'open';
}

export function maxQty(show, key) {
  return Math.min(MAX_TICKETS_PER_ORDER, remaining(show, key));
}

// בדיקה לפני רכישה. מחזיר קוד שגיאה או מחרוזת ריקה.
export function purchaseProblem(show, key, qty, now = Date.now()) {
  if (!show) return 'app/show-missing';
  if (isPast(show, now)) return 'app/show-ended';
  if (!show.active) return 'app/show-inactive';
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_TICKETS_PER_ORDER) return 'app/qty-invalid';
  if (!show.sections?.[key]) return 'app/qty-invalid';
  if (remaining(show, key) < qty) return 'app/sold-out';
  return '';
}
