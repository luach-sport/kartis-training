// בדיקות של כללי האבטחה: מה מותר, ובעיקר — מה אסור (ניסיונות "פריצה").
// רצות מול אמולטור של Firebase ב-GitHub Actions לפני כל בנייה של APK.
import { test, before, after, beforeEach } from 'node:test';
import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection,
  writeBatch, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { makeEnv, userDb, showDoc, seed, orderFor, DAY } from './helpers.js';

let env;
const SHOW = showDoc();

before(async () => { env = await makeEnv(); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await seed(env, 'shows/show1', SHOW);
});

// רכישה כמו שהאפליקציה עושה: הזמנה + עדכון המונה, באותה פעולה.
function purchaseBatch(db, uid, orderId, { order = {}, soldDelta, section = 'regular', qty = 2, skipShow = false, skipOrder = false, show = SHOW } = {}) {
  const batch = writeBatch(db);
  if (!skipOrder) {
    batch.set(doc(db, `users/${uid}/orders/${orderId}`), {
      ...orderFor(show, { section, qty }), createdAt: serverTimestamp(), ...order
    });
  }
  if (!skipShow) {
    batch.update(doc(db, 'shows/show1'), {
      [`sold.${section}`]: (show.sold[section] || 0) + (soldDelta ?? qty),
      lastSale: { orderId, at: serverTimestamp() }
    });
  }
  return batch.commit();
}

// ---------------- פרופיל ----------------

test('profile: owner can create a valid profile, nobody else can read it', async () => {
  const alice = userDb(env, 'alice');
  const profile = { displayName: 'אליס', email: 'alice@example.com', phone: '0521234567', city: 'חיפה', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(doc(alice, 'users/alice'), profile));
  await assertSucceeds(getDoc(doc(alice, 'users/alice')));
  await assertFails(getDoc(doc(userDb(env, 'bob'), 'users/alice')));
  await assertFails(getDocs(collection(userDb(env, 'bob'), 'users')));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users/alice')));
});

test('profile: bad data is rejected', async () => {
  const alice = userDb(env, 'alice');
  const base = { displayName: 'אליס', email: 'alice@example.com', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await assertFails(setDoc(doc(alice, 'users/bob'), { ...base, email: 'bob@example.com' }));          // של מישהו אחר
  await assertFails(setDoc(doc(alice, 'users/alice'), { ...base, email: 'fake@example.com' }));       // מייל לא שלו
  await assertFails(setDoc(doc(alice, 'users/alice'), { ...base, phone: '12' }));                     // טלפון לא תקין
  await assertFails(setDoc(doc(alice, 'users/alice'), { ...base, isAdmin: true }));                   // שדה לא מוכר
  await assertFails(setDoc(doc(alice, 'users/alice'), { ...base, displayName: '' }));
  await assertFails(setDoc(doc(alice, 'users/alice'), { ...base, createdAt: Timestamp.fromDate(new Date(2000, 1, 1)) }));
  await assertSucceeds(setDoc(doc(alice, 'users/alice'), base));
  await assertFails(updateDoc(doc(alice, 'users/alice'), { createdAt: Timestamp.now(), updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(alice, 'users/alice'), { displayName: 'אליס כהן', updatedAt: serverTimestamp() }));
});

// ---------------- מנהלים ----------------

test('admins: nobody can make themselves admin; only admins manage shows', async () => {
  const alice = userDb(env, 'alice');
  await assertFails(setDoc(doc(alice, 'admins/alice'), { role: 'admin' }));
  await assertSucceeds(getDoc(doc(alice, 'admins/alice')));
  await assertFails(getDoc(doc(alice, 'admins/bob')));
  await assertFails(setDoc(doc(alice, 'shows/new'), showDoc()));
  await assertFails(updateDoc(doc(alice, 'shows/show1'), { active: false }));
  await assertFails(deleteDoc(doc(alice, 'shows/show1')));

  await seed(env, 'admins/boss', { note: 'created in console' });
  const boss = userDb(env, 'boss');
  await assertSucceeds(setDoc(doc(boss, 'shows/new'), { ...showDoc(), createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(boss, 'shows/rigged'), { ...showDoc(), sold: { regular: 5, vip: 0 } }));
  await assertSucceeds(updateDoc(doc(boss, 'shows/show1'), { active: false }));
  await assertFails(updateDoc(doc(boss, 'shows/show1'), { 'sold.regular': 10 }));
});

test('shows: readable only when signed in', async () => {
  await assertSucceeds(getDoc(doc(userDb(env, 'alice'), 'shows/show1')));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'shows/show1')));
});

// ---------------- רכישה ----------------

test('purchase: a correct order plus stock update succeeds', async () => {
  await assertSucceeds(purchaseBatch(userDb(env, 'alice'), 'alice', 'o1'));
});

test('purchase: unverified email is refused', async () => {
  await assertFails(purchaseBatch(userDb(env, 'alice', { verified: false }), 'alice', 'o1'));
});

test('purchase: cannot change the price or total', async () => {
  const alice = userDb(env, 'alice');
  await assertFails(purchaseBatch(alice, 'alice', 'o1', { order: { unitPrice: 1, total: 2 } }));
  await assertFails(purchaseBatch(alice, 'alice', 'o2', { order: { total: 1 } }));
  await assertFails(purchaseBatch(alice, 'alice', 'o3', { order: { showTitle: 'משהו אחר' } }));
  await assertFails(purchaseBatch(alice, 'alice', 'o4', { order: { status: 'cancelled' } }));
});

test('purchase: order without updating the stock (or the reverse) is refused', async () => {
  const alice = userDb(env, 'alice');
  await assertFails(purchaseBatch(alice, 'alice', 'o1', { skipShow: true }));
  await assertFails(purchaseBatch(alice, 'alice', 'o2', { skipOrder: true }));
  await assertFails(purchaseBatch(alice, 'alice', 'o3', { soldDelta: 1 }));   // מוסיף פחות למונה
  await assertFails(purchaseBatch(alice, 'alice', 'o4', { soldDelta: -5 }));  // "מחזיר" כרטיסים
});

test('purchase: cannot buy more than what is left, or more than 6', async () => {
  const alice = userDb(env, 'alice');
  await assertFails(purchaseBatch(alice, 'alice', 'o1', { section: 'vip', qty: 4 }));
  await assertSucceeds(purchaseBatch(alice, 'alice', 'o2', { section: 'vip', qty: 3 }));
  await assertFails(purchaseBatch(alice, 'alice', 'o3', { section: 'regular', qty: 7 }));
  await assertFails(purchaseBatch(alice, 'alice', 'o4', { section: 'balcony', qty: 1 }));
});

test('purchase: closed or past shows are refused', async () => {
  const alice = userDb(env, 'alice');
  const closed = showDoc({ active: false });
  await seed(env, 'shows/show1', closed);
  await assertFails(purchaseBatch(alice, 'alice', 'o1', { show: closed }));
  const past = showDoc({ startsAt: Timestamp.fromDate(new Date(Date.now() - DAY)) });
  await seed(env, 'shows/show1', past);
  await assertFails(purchaseBatch(alice, 'alice', 'o2', { show: past }));
});

test('purchase: cannot write orders into someone else\'s account', async () => {
  const alice = userDb(env, 'alice');
  await assertFails(purchaseBatch(alice, 'bob', 'o1'));
});

test('orders: private to their owner', async () => {
  await assertSucceeds(purchaseBatch(userDb(env, 'alice'), 'alice', 'o1'));
  await assertSucceeds(getDoc(doc(userDb(env, 'alice'), 'users/alice/orders/o1')));
  await assertFails(getDoc(doc(userDb(env, 'bob'), 'users/alice/orders/o1')));
  await assertFails(getDocs(collection(userDb(env, 'bob'), 'users/alice/orders')));
});

// ---------------- ביטול ----------------

async function boughtTwo() {
  await purchaseBatch(userDb(env, 'alice'), 'alice', 'o1');
  const after = { ...SHOW, sold: { regular: 2, vip: 0 } };
  return after;
}

function cancelBatch(db, uid, orderId, { delta = 2, touchShow = true } = {}) {
  const batch = writeBatch(db);
  batch.update(doc(db, `users/${uid}/orders/${orderId}`), { status: 'cancelled', cancelledAt: serverTimestamp() });
  if (touchShow) {
    batch.update(doc(db, 'shows/show1'), { 'sold.regular': 2 - delta, lastSale: { orderId, at: serverTimestamp() } });
  }
  return batch.commit();
}

test('cancel: returns the seats and marks the order cancelled', async () => {
  await boughtTwo();
  await assertSucceeds(cancelBatch(userDb(env, 'alice'), 'alice', 'o1'));
  // אי אפשר לבטל פעמיים
  await assertFails(cancelBatch(userDb(env, 'alice'), 'alice', 'o1', { delta: 0 }));
});

test('cancel: must return exactly the bought seats, and only your own', async () => {
  await boughtTwo();
  await assertFails(cancelBatch(userDb(env, 'alice'), 'alice', 'o1', { touchShow: false }));
  await assertFails(cancelBatch(userDb(env, 'alice'), 'alice', 'o1', { delta: 1 }));
  await assertFails(cancelBatch(userDb(env, 'bob'), 'alice', 'o1'));
});

test('orders: cannot be edited except for cancelling', async () => {
  await boughtTwo();
  await assertFails(updateDoc(doc(userDb(env, 'alice'), 'users/alice/orders/o1'), { qty: 6 }));
  await assertSucceeds(deleteDoc(doc(userDb(env, 'alice'), 'users/alice/orders/o1')));
});

// ---------------- מכשירים ----------------

test('devices: register, update and remove your own devices only', async () => {
  const alice = userDb(env, 'alice');
  const device = { name: 'Pixel 9', platform: 'android', model: 'Pixel 9', appVersion: '1.0', createdAt: serverTimestamp(), lastSeen: serverTimestamp() };
  await assertSucceeds(setDoc(doc(alice, 'users/alice/devices/d1'), device));
  await assertSucceeds(updateDoc(doc(alice, 'users/alice/devices/d1'), { lastSeen: serverTimestamp() }));
  await assertFails(updateDoc(doc(alice, 'users/alice/devices/d1'), { lastSeen: Timestamp.fromDate(new Date(2030, 1, 1)) }));
  await assertFails(setDoc(doc(alice, 'users/bob/devices/d1'), device));
  await assertFails(getDoc(doc(userDb(env, 'bob'), 'users/alice/devices/d1')));
  await assertSucceeds(deleteDoc(doc(alice, 'users/alice/devices/d1')));
});
