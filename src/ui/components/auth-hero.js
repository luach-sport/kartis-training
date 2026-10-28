// הכותרת הגדולה במסכי הכניסה וההרשמה.
import { h } from '../../core/dom.js';

export function authHero(subtitle) {
  return h('div', { class: 'auth-hero' },
    h('div', { class: 'auth-hero__logo', 'aria-hidden': 'true' },
      h('span', { class: 'auth-hero__ticket' }, '🎟️')
    ),
    h('h1', { class: 'auth-hero__name' }, 'כרטיס'),
    h('p', { class: 'auth-hero__sub' }, subtitle)
  );
}

export function divider(text) {
  return h('div', { class: 'divider', role: 'separator' }, h('span', {}, text));
}
