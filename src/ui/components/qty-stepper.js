// בורר כמות: − 2 +
import { h, icon } from '../../core/dom.js';

export function qtyStepper({ value = 1, min = 1, max = 6, onChange }) {
  let current = value;
  const out = h('output', { class: 'stepper__value', 'aria-live': 'polite' }, String(current));
  const minus = h('button', { type: 'button', class: 'stepper__btn', 'aria-label': 'פחות כרטיסים' }, icon('minus', 20));
  const plus = h('button', { type: 'button', class: 'stepper__btn', 'aria-label': 'יותר כרטיסים' }, icon('plus', 20));

  const set = (v) => {
    current = Math.max(min, Math.min(max, v));
    out.textContent = String(current);
    minus.disabled = current <= min;
    plus.disabled = current >= max;
    onChange?.(current);
  };
  minus.addEventListener('click', () => set(current - 1));
  plus.addEventListener('click', () => set(current + 1));

  const el = h('div', { class: 'stepper' }, plus, out, minus);
  set(current);
  return {
    el,
    get value() { return current; },
    setMax(newMax) { max = Math.max(min, newMax); set(current); }
  };
}
