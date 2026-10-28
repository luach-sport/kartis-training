import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, formatAgo, ticketsWord, initials, toDate } from '../../src/core/format.js';
import { makeTicketCode, formatTicketCode } from '../../src/core/ticket-code.js';
import { describeError, errorCode, isCancel, appError } from '../../src/core/errors.js';
import { SAMPLE_SHOWS, sampleStartDate } from '../../src/data/sample-shows.js';

test('formatting', () => {
  assert.match(formatPrice(149), /149/);
  assert.match(formatPrice(149), /₪/);
  assert.equal(ticketsWord(1), 'כרטיס אחד');
  assert.equal(ticketsWord(3), '3 כרטיסים');
  assert.equal(initials('דנה כהן'), 'דכ');
  assert.equal(initials(''), '?');
  const now = Date.now();
  assert.equal(formatAgo(new Date(now - 10e3), now), 'עכשיו');
  assert.equal(formatAgo(new Date(now - 5 * 60e3), now), 'לפני 5 דקות');
  assert.equal(formatAgo(new Date(now - 26 * 3600e3), now), 'אתמול');
  assert.equal(toDate({ seconds: 10 }).getTime(), 10000);
});

test('ticket codes are random, readable and the length the server accepts', () => {
  const a = makeTicketCode();
  const b = makeTicketCode();
  assert.equal(a.length, 10);
  assert.notEqual(a, b);
  assert.match(a, /^[A-HJ-NP-Z2-9]+$/);
  assert.equal(formatTicketCode('ABCDEFGHJK'), 'ABCD-EFGH-JK');
});

test('errors become Hebrew messages', () => {
  assert.equal(describeError({ code: 'auth/wrong-password' }), 'המייל או הסיסמה לא נכונים.');
  assert.equal(describeError({ code: 'permission-denied' }), 'אין הרשאה לפעולה הזו.');
  assert.equal(describeError(appError('app/sold-out')), 'אין מספיק כרטיסים פנויים באזור הזה.');
  assert.equal(describeError(new Error('weird')), 'משהו השתבש. נסה שוב בעוד רגע.');
  assert.equal(errorCode(new Error('The user canceled the sign-in flow.')), 'app/cancelled');
  assert.ok(isCancel({ code: 'auth/popup-closed-by-user' }));
  assert.ok(!isCancel({ code: 'auth/wrong-password' }));
});

test('sample shows are valid for the security rules', () => {
  const ids = new Set();
  for (const s of SAMPLE_SHOWS) {
    assert.ok(!ids.has(s.id), 'unique id');
    ids.add(s.id);
    assert.ok(s.title.length <= 80 && s.artist.length <= 80 && s.venue.length <= 80 && s.city.length <= 40);
    assert.ok(s.description.length <= 600);
    assert.equal(s.colors.length, 2);
    const keys = Object.keys(s.sections);
    assert.ok(keys.length >= 1 && keys.length <= 4);
    for (const k of keys) {
      assert.match(k, /^[a-z]+$/);
      assert.ok(Number.isInteger(s.sections[k].price) && s.sections[k].price > 0);
      assert.ok(Number.isInteger(s.sections[k].capacity) && s.sections[k].capacity > 0);
    }
    assert.ok(sampleStartDate(s) > new Date());
  }
});
