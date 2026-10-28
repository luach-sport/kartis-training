// שדה סיסמה עם כפתור הצגה/הסתרה, ואופציונלית מד חוזק.
import { h, icon } from '../../core/dom.js';
import { field } from './field.js';
import { passwordScore, PASSWORD_LABELS } from '../../core/validate.js';

export function passwordField({ label = 'סיסמה', name = 'password', autocomplete = 'current-password', meter = false, hint } = {}) {
  const f = field({ label, name, type: 'password', autocomplete, dir: 'ltr', hint });
  const toggle = h('button', { type: 'button', class: 'field__toggle', 'aria-label': 'הצגת הסיסמה' }, icon('eye', 20));
  toggle.addEventListener('click', () => {
    const show = f.input.type === 'password';
    f.input.type = show ? 'text' : 'password';
    toggle.replaceChildren(icon(show ? 'eyeOff' : 'eye', 20));
    toggle.setAttribute('aria-label', show ? 'הסתרת הסיסמה' : 'הצגת הסיסמה');
  });
  const wrap = h('div', { class: 'field__with-toggle' });
  f.input.replaceWith(wrap);
  wrap.append(f.input, toggle);

  if (meter) {
    const bar = h('div', { class: 'strength', 'data-score': '0' }, h('span'), h('span'), h('span'), h('span'));
    const text = h('span', { class: 'strength__label' }, '');
    const row = h('div', { class: 'strength-row' }, bar, text);
    wrap.after(row);
    f.input.addEventListener('input', () => {
      const score = passwordScore(f.input.value);
      bar.dataset.score = String(score);
      text.textContent = f.input.value ? PASSWORD_LABELS[score] : '';
    });
  }
  return f;
}
