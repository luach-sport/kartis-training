import { h } from '../../core/dom.js';
import { initials } from '../../core/format.js';

export function avatar(name, size = 'md') {
  return h('div', { class: `avatar avatar--${size}`, 'aria-hidden': 'true' }, initials(name));
}
