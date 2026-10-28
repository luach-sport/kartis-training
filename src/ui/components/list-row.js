// שורה ברשימת הגדרות: אייקון, כותרת, תיאור קטן, וחץ.
import { h, icon } from '../../core/dom.js';

export function listRow({ iconName, title, subtitle, onClick, danger = false, trailing }) {
  const content = [
    iconName ? h('span', { class: 'row__icon' }, icon(iconName, 20)) : null,
    h('span', { class: 'row__text' },
      h('span', { class: 'row__title' }, title),
      subtitle ? h('span', { class: 'row__sub' }, subtitle) : null
    ),
    trailing !== undefined ? trailing : (onClick ? h('span', { class: 'row__chev' }, icon('chevron', 18)) : null)
  ];
  return onClick
    ? h('button', { class: `row${danger ? ' row--danger' : ''}`, onclick: onClick }, ...content)
    : h('div', { class: 'row' }, ...content);
}

export function rowGroup(title, ...rows) {
  return h('section', { class: 'group' },
    title ? h('h2', { class: 'group__title' }, title) : null,
    h('div', { class: 'group__rows' }, ...rows)
  );
}
