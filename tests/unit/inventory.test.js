import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  remaining, totalRemaining, lowestPrice, showStatus, maxQty, purchaseProblem, sectionKeys
} from '../../src/core/inventory.js';

const DAY = 864e5;
const show = (over = {}) => ({
  active: true,
  startsAt: new Date(Date.now() + 5 * DAY),
  sections: { vip: { name: 'VIP', price: 300, capacity: 10 }, regular: { name: 'רגיל', price: 100, capacity: 200 } },
  sold: { vip: 8, regular: 0 },
  ...over
});

test('remaining seats per section and total', () => {
  const s = show();
  assert.equal(remaining(s, 'vip'), 2);
  assert.equal(remaining(s, 'regular'), 200);
  assert.equal(remaining(s, 'nope'), 0);
  assert.equal(totalRemaining(s), 202);
  assert.equal(lowestPrice(s), 100);
  assert.deepEqual(sectionKeys(s), ['regular', 'vip']);
});

test('max quantity is limited by stock and by the per-order cap', () => {
  const s = show();
  assert.equal(maxQty(s, 'vip'), 2);
  assert.equal(maxQty(s, 'regular'), 6);
});

test('status', () => {
  assert.equal(showStatus(show()), 'open');
  assert.equal(showStatus(show({ sold: { vip: 10, regular: 195 } })), 'low');
  assert.equal(showStatus(show({ sold: { vip: 10, regular: 200 } })), 'soldout');
  assert.equal(showStatus(show({ active: false })), 'closed');
  assert.equal(showStatus(show({ startsAt: new Date(Date.now() - DAY) })), 'past');
  // Firestore Timestamp-like objects work too
  assert.equal(showStatus(show({ startsAt: { toDate: () => new Date(Date.now() - DAY) } })), 'past');
});

test('purchase checks mirror the server rules', () => {
  const s = show();
  assert.equal(purchaseProblem(s, 'regular', 2), '');
  assert.equal(purchaseProblem(s, 'vip', 3), 'app/sold-out');
  assert.equal(purchaseProblem(s, 'regular', 0), 'app/qty-invalid');
  assert.equal(purchaseProblem(s, 'regular', 7), 'app/qty-invalid');
  assert.equal(purchaseProblem(s, 'regular', 1.5), 'app/qty-invalid');
  assert.equal(purchaseProblem(s, 'balcony', 1), 'app/qty-invalid');
  assert.equal(purchaseProblem(show({ active: false }), 'regular', 1), 'app/show-inactive');
  assert.equal(purchaseProblem(show({ startsAt: new Date(Date.now() - 1000) }), 'regular', 1), 'app/show-ended');
  assert.equal(purchaseProblem(null, 'regular', 1), 'app/show-missing');
});
