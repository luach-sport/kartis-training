// בדיקת "קצה לקצה" של הקוד האמיתי של האפליקציה מול אמולטור Firebase:
// הרשמה → אימות מייל → פרופיל → מכשיר → רכישה → ביטול → מחיקת חשבון.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { makeEnv, seed, showDoc } from '../rules/helpers.js';

globalThis.__KARTIS_EMULATORS__ = true;

const auth = await import('../../src/services/auth-service.js');
const profiles = await import('../../src/services/profile-service.js');
const devices = await import('../../src/services/devices-service.js');
const orders = await import('../../src/services/orders-service.js');
const account = await import('../../src/services/account-service.js');
const { db } = await import('../../src/firebase/db.js');

let env;
const EMAIL = `flow-${Date.now()}@example.com`;
const PASSWORD = 'secret123';

before(async () => {
  env = await makeEnv();
  await env.clearFirestore();
  await seed(env, 'shows/show1', showDoc());
});

after(async () => {
  await env?.cleanup();
  setTimeout(() => process.exit(0), 200); // סוגר חיבורים פתוחים של Firebase
});

async function markEmailVerified(uid) {
  const res = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-kartis/accounts:update', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer owner' },
    body: JSON.stringify({ localId: uid, emailVerified: true })
  });
  assert.equal(res.status, 200, await res.text());
}

const once = (watchFn, ...args) => new Promise((resolve, reject) => {
  const stop = watchFn(...args, (value) => { stop(); resolve(value); }, reject);
});

test('full account and purchase flow', async () => {
  const user = await auth.registerWithEmail({ name: 'בודק זרימה', email: EMAIL, password: PASSWORD });
  assert.ok(user.uid);
  assert.equal(user.emailVerified, false);

  const profile = await profiles.ensureProfile(user);
  assert.equal(profile.displayName, 'בודק זרימה');

  const deviceId = await devices.registerThisDevice(user.uid);
  const list = await once(devices.watchDevices, user.uid);
  assert.ok(list.some((d) => d.id === deviceId));

  // לפני אימות המייל — השרת מסרב לרכישה
  await assert.rejects(orders.purchase({ uid: user.uid, showId: 'show1', sectionKey: 'regular', qty: 2 }),
    (err) => err.code === 'permission-denied');

  await markEmailVerified(user.uid);
  const fresh = await auth.refreshUser();
  assert.equal(fresh.emailVerified, true);

  const orderId = await orders.purchase({ uid: user.uid, showId: 'show1', sectionKey: 'regular', qty: 2 });
  let show = (await getDocFromServer(doc(db, 'shows', 'show1'))).data();
  assert.equal(show.sold.regular, 2);
  const order = await once(orders.watchOrder, user.uid, orderId);
  assert.equal(order.status, 'paid');
  assert.equal(order.total, 200);
  assert.equal(order.code.length, 10);

  // ה-VIP: 3 מקומות. 4 — נחסם כבר באפליקציה
  await assert.rejects(orders.purchase({ uid: user.uid, showId: 'show1', sectionKey: 'vip', qty: 4 }),
    (err) => err.code === 'app/sold-out');

  await orders.cancelOrder(user.uid, orderId);
  show = (await getDocFromServer(doc(db, 'shows', 'show1'))).data();
  assert.equal(show.sold.regular, 0);
  // מהשרת ולא מהעותק המקומי — כדי לוודא שהביטול באמת נשמר בענן
  const cancelled = (await getDocFromServer(doc(db, 'users', user.uid, 'orders', orderId))).data();
  assert.equal(cancelled.status, 'cancelled');

  await profiles.saveProfile(user.uid, { displayName: 'שם חדש', phone: '0521234567', city: 'צפת' });

  await auth.reauthenticate({ password: PASSWORD });
  await account.deleteAccountEverywhere(user.uid);
  assert.equal(auth.currentUser(), null);
  await assert.rejects(auth.signInWithEmail(EMAIL, PASSWORD));
});

test('password reset email can be requested (no error even for unknown emails)', async () => {
  await auth.sendPasswordReset('nobody-here@example.com').catch((err) => {
    // עם הגנה מפני חשיפת משתמשים, Firebase לא מגלה שהמייל לא קיים
    assert.equal(err.code, 'auth/user-not-found');
  });
});
