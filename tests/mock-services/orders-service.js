import { db, delay, notify, watch, newId } from './mock-db.js';
import { appError } from '../../src/core/errors.js';
import { purchaseProblem, isPast } from '../../src/core/inventory.js';
import { makeTicketCode } from '../../src/core/ticket-code.js';

export async function purchase({ uid, showId, sectionKey, qty }) {
  await delay(300);
  const show = db.shows[showId];
  const problem = purchaseProblem(show, sectionKey, qty);
  if (problem) throw appError(problem);
  const sec = show.sections[sectionKey];
  const id = newId();
  (db.orders[uid] ||= {})[id] = {
    showId, section: sectionKey, sectionName: sec.name, qty, unitPrice: sec.price, total: sec.price * qty,
    status: 'paid', code: makeTicketCode(), showTitle: show.title, venue: show.venue, city: show.city,
    startsAt: show.startsAt, emoji: show.emoji, createdAt: new Date()
  };
  show.sold[sectionKey] += qty;
  notify();
  return id;
}

export async function cancelOrder(uid, orderId) {
  await delay(300);
  const order = db.orders[uid]?.[orderId];
  if (!order) throw appError('app/order-missing');
  if (order.status !== 'paid') throw appError('app/not-cancellable');
  const show = db.shows[order.showId];
  if (isPast(show)) throw appError('app/show-ended');
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  show.sold[order.section] -= order.qty;
  notify();
}

export function watchOrders(uid, callback) {
  return watch(() => callback(Object.entries(db.orders[uid] || {}).map(([id, o]) => ({ id, ...o }))
    .sort((a, b) => b.createdAt - a.createdAt), false));
}

export function watchOrder(uid, orderId, callback) {
  return watch(() => {
    const o = db.orders[uid]?.[orderId];
    callback(o ? { id: orderId, ...o } : null);
  });
}
