// מוצג רק אם שכחו להכניס את פרטי הפרויקט ב-src/config/firebase-config.js.
import { h, mount } from '../core/dom.js';

export function renderNotConfigured(root) {
  mount(root, h('div', { class: 'splash splash--text' },
    h('div', { class: 'splash__logo', 'aria-hidden': 'true' }, '🛠️'),
    h('h1', {}, 'האפליקציה עוד לא מחוברת ל-Firebase'),
    h('p', {}, 'צריך למלא את פרטי הפרויקט בקובץ src/config/firebase-config.js ולבנות מחדש.')
  ));
}
