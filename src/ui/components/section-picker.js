// בחירת אזור באולם (עמידה / ישיבה / VIP), עם מחיר וכמה מקומות נשארו.
import { h } from '../../core/dom.js';
import { formatPrice } from '../../core/format.js';
import { sectionKeys, remaining } from '../../core/inventory.js';

export function sectionPicker(show, { selected, onSelect }) {
  const el = h('div', { class: 'sections', role: 'radiogroup', 'aria-label': 'בחירת אזור' });

  const render = (s, current) => {
    el.replaceChildren(...sectionKeys(s).map((key) => {
      const sec = s.sections[key];
      const left = remaining(s, key);
      const isOn = key === current;
      return h('button', {
        type: 'button',
        role: 'radio',
        'aria-checked': isOn ? 'true' : 'false',
        class: `section-opt${isOn ? ' is-on' : ''}${left === 0 ? ' is-out' : ''}`,
        disabled: left === 0,
        onclick: () => onSelect(key)
      },
        h('span', { class: 'section-opt__name' }, sec.name),
        h('span', { class: 'section-opt__price' }, formatPrice(sec.price)),
        h('span', { class: 'section-opt__left' }, left === 0 ? 'אזל' : left <= 20 ? `נשארו ${left}` : `${left} פנויים`)
      );
    }));
  };

  render(show, selected);
  return { el, update: render };
}
