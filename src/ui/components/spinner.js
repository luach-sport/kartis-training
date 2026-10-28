import { h } from '../../core/dom.js';

export function spinner(label = 'טוען…') {
  return h('div', { class: 'loader', role: 'status' },
    h('span', { class: 'loader__dot' }),
    h('span', { class: 'loader__text' }, label)
  );
}
