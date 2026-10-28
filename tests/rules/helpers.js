// עזרים לבדיקות כללי האבטחה מול האמולטור.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export const DAY = 864e5;

export async function makeEnv() {
  return initializeTestEnvironment({
    projectId: 'demo-kartis',
    firestore: {
      rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });
}

// משתמש מחובר. ברירת מחדל: מייל מאומת.
export function userDb(env, uid, { verified = true } = {}) {
  return env.authenticatedContext(uid, { email: `${uid}@example.com`, email_verified: verified }).firestore();
}

export function showDoc(over = {}) {
  return {
    title: 'ערב בדיקות',
    artist: 'להקת הבדיקה',
    venue: 'אולם הבדיקות',
    city: 'תל אביב',
    startsAt: Timestamp.fromDate(new Date(Date.now() + 10 * DAY)),
    emoji: '🎸',
    colors: ['#000000', '#FFFFFF'],
    description: 'הופעה לבדיקות',
    active: true,
    sections: {
      regular: { name: 'רגיל', price: 100, capacity: 50 },
      vip: { name: 'VIP', price: 300, capacity: 3 }
    },
    sold: { regular: 0, vip: 0 },
    lastSale: null,
    createdAt: Timestamp.now(),
    ...over
  };
}

// כותב נתונים בלי כללי אבטחה (כמו מנהל מערכת), כדי להכין את המצב לבדיקה.
export async function seed(env, path, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

export function orderFor(show, { showId = 'show1', section = 'regular', qty = 2, ...over } = {}) {
  const sec = show.sections[section] || { name: section, price: 100 }; // אזור שלא קיים — לבדיקת סירוב
  return {
    showId,
    section,
    sectionName: sec.name,
    qty,
    unitPrice: sec.price,
    total: sec.price * qty,
    status: 'paid',
    code: 'ABCDEFGHJK',
    showTitle: show.title,
    venue: show.venue,
    city: show.city,
    startsAt: show.startsAt,
    emoji: show.emoji,
    ...over
  };
}
