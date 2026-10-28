// שדה טופס עם תווית, הודעת שגיאה מתחת ונגישות (aria).
import { h } from '../../core/dom.js';

let counter = 0;

export function field({ label, name, type = 'text', value = '', placeholder = '', autocomplete, inputmode, dir, hint, maxlength }) {
  const id = `f-${name}-${++counter}`;
  const input = h('input', {
    id, name, type, value, placeholder, autocomplete, inputmode, dir, maxlength,
    class: 'input', 'aria-describedby': `${id}-msg`
  });
  const message = h('p', { class: 'field__msg', id: `${id}-msg` }, hint || '');
  const el = h('div', { class: 'field' }, h('label', { class: 'field__label', for: id }, label), input, message);

  const setError = (text) => {
    el.classList.toggle('has-error', Boolean(text));
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    message.textContent = text || hint || '';
  };
  input.addEventListener('input', () => { if (el.classList.contains('has-error')) setError(''); });

  return { el, input, setError, get value() { return input.value; } };
}
