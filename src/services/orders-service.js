// הזמנות וכרטיסים: users/{uid}/orders/{orderId}
// רכישה וביטול נעשים ב"טרנזקציה": הקריאה של המלאי והכתיבה של ההזמנה קורות כיחידה אחת,
// כך ששני אנשים שקונים את הכרטיס האחרון באותה שנייה לא יקבלו את אותו מקום.
import {
  collection, doc, onSnapshot, orderBy, query,
  runTransaction, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/db.js';
import { appError } from '../core/errors.js';
import { purchaseProblem, isPast } from '../core/inventory.js';
import { makeTicketCode } from '../core/ticket-code.js';
import { isOnline } from '../core/net-status.js';

const ordersCol = (uid) => collection(db, 'users', uid, 'orders');

export async function purchase({ uid, showId, sectionKey, qty }) {
  if (!isOnline()) throw appError('app/offline');
  const showRef = doc(db, 'shows', showId);
  const orderRef = doc(ordersCol(uid)); // מזהה אקראי חדש

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(showRef);
    if (!snap.exists()) throw appError('app/show-missing');
    const show = snap.data();
    const problem = purchaseProblem(show, sectionKey, qty);
    if (problem) throw appError(problem);

    const section = show.sections[sectionKey];
    tx.set(orderRef, {
      showId,
      section: sectionKey,
      sectionName: section.name,
      qty,
      unitPrice: section.price,
      total: section.price * qty,
      status: 'paid',
      code: makeTicketCode(),
      showTitle: show.title,
      venue: show.venue,
      city: show.city,
      startsAt: show.startsAt,
      emoji: show.emoji,
      createdAt: serverTimestamp()
    });
    tx.update(showRef, {
      [`sold.${sectionKey}`]: (show.sold?.[sectionKey] || 0) + qty,
      lastSale: { orderId: orderRef.id, at: serverTimestamp() }
    });
  });

  return orderRef.id;
}

export async function cancelOrder(uid, orderId) {
  if (!isOnline()) throw appError('app/offline');
  const orderRef = doc(db, 'users', uid, 'orders', orderId);

  await runTransaction(db, async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw appError('app/order-missing');
    const order = orderSnap.data();
    if (order.status !== 'paid') throw appError('app/not-cancellable');

    const showRef = doc(db, 'shows', order.showId);
    const showSnap = await tx.get(showRef);
    if (!showSnap.exists()) throw appError('app/show-missing');
    const show = showSnap.data();
    if (isPast(show)) throw appError('app/show-ended');

    tx.update(orderRef, { status: 'cancelled', cancelledAt: serverTimestamp() });
    tx.update(showRef, {
      [`sold.${order.section}`]: (show.sold?.[order.section] || 0) - order.qty,
      lastSale: { orderId, at: serverTimestamp() }
    });
  });
}

const toOrder = (snap) => ({ id: snap.id, ...snap.data({ serverTimestamps: 'estimate' }) });

export function watchOrders(uid, callback, onError) {
  const q = query(ordersCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(toOrder), snap.metadata.fromCache), onError);
}

export function watchOrder(uid, orderId, callback, onError) {
  return onSnapshot(
    doc(db, 'users', uid, 'orders', orderId),
    (snap) => callback(snap.exists() ? toOrder(snap) : null),
    onError
  );
}
