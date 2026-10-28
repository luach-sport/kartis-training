import { h, icon } from '../../core/dom.js';

export function emptyState({ iconName = 'ticket', title, text, action }) {
  return h('div', { class: 'empty' },
    h('div', { class: 'empty__icon' }, icon(iconName, 34)),
    h('h2', { class: 'empty__title' }, title),
    text ? h('p', { class: 'empty__text' }, text) : null,
    action || null
  );
}
