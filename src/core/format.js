// תצוגה של מחירים, תאריכים ושעות בפורמט ישראלי.

const priceFmt = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDateFmt = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });

// Firestore מחזיר Timestamp; בבדיקות ובמצב דמו זה יכול להיות Date או מספר.
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  return null;
}

export const formatPrice = (n) => priceFmt.format(Number(n) || 0);

export function formatDate(value) {
  const d = toDate(value);
  return d ? dateFmt.format(d) : '';
}

export function formatShortDate(value) {
  const d = toDate(value);
  return d ? shortDateFmt.format(d) : '';
}

export function formatTime(value) {
  const d = toDate(value);
  return d ? timeFmt.format(d) : '';
}

export function formatDateTime(value) {
  const d = toDate(value);
  return d ? `${dateFmt.format(d)} · ${timeFmt.format(d)}` : '';
}

// "לפני 5 דקות", "אתמול" וכו' — לרשימת המכשירים.
export function formatAgo(value, now = Date.now()) {
  const d = toDate(value);
  if (!d) return 'עכשיו';
  const sec = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (sec < 60) return 'עכשיו';
  const min = Math.round(sec / 60);
  if (min < 60) return min === 1 ? 'לפני דקה' : `לפני ${min} דקות`;
  const hours = Math.round(min / 60);
  if (hours < 24) return hours === 1 ? 'לפני שעה' : `לפני ${hours} שעות`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'אתמול';
  if (days < 30) return `לפני ${days} ימים`;
  return formatShortDate(d);
}

export function ticketsWord(n) {
  return n === 1 ? 'כרטיס אחד' : `${n} כרטיסים`;
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}
