import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkEmail, checkName, checkPhone, checkPassword, checkPasswordMatch,
  passwordScore, normalizeEmail, normalizePhone
} from '../../src/core/validate.js';

test('email', () => {
  assert.equal(checkEmail(''), 'צריך למלא כתובת מייל.');
  assert.equal(checkEmail('abc'), 'כתובת המייל לא תקינה.');
  assert.equal(checkEmail('a@b'), 'כתובת המייל לא תקינה.');
  assert.equal(checkEmail(' Dana@Example.com '), '');
  assert.equal(normalizeEmail(' Dana@Example.COM '), 'dana@example.com');
});

test('name', () => {
  assert.notEqual(checkName(''), '');
  assert.notEqual(checkName('א'), '');
  assert.equal(checkName('דנה כהן'), '');
  assert.notEqual(checkName('א'.repeat(61)), '');
});

test('phone is optional but must be Israeli when given (same rule as the server)', () => {
  assert.equal(checkPhone(''), '');
  assert.equal(checkPhone('052-123-4567'), '');
  assert.equal(checkPhone('031234567'), '');
  assert.notEqual(checkPhone('12'), '');
  assert.notEqual(checkPhone('5212345678'), '');
  assert.equal(normalizePhone('052 123-4567'), '0521234567');
});

test('password rules and strength', () => {
  assert.notEqual(checkPassword('abc'), '');
  assert.notEqual(checkPassword('abcdefgh'), '');
  assert.notEqual(checkPassword('12345678'), '');
  assert.equal(checkPassword('secret123'), '');
  assert.equal(checkPasswordMatch('a', 'a'), '');
  assert.notEqual(checkPasswordMatch('a', 'b'), '');
  assert.equal(passwordScore(''), 0);
  assert.ok(passwordScore('secret123') >= 2);
  assert.equal(passwordScore('Very$trongPassw0rd'), 4);
});
