// "פוסטר" צבעוני להופעה: מעבר צבעים ואימוג'י, בלי תמונות מבחוץ.
import { h } from '../../core/dom.js';

export function poster(show, size = 'card') {
  const [a, b] = show.colors || ['#FF6B4A', '#7B2FF7'];
  return h('div', {
    class: `poster poster--${size}`,
    style: { background: `linear-gradient(135deg, ${a}, ${b})` },
    'aria-hidden': 'true'
  },
    h('span', { class: 'poster__emoji' }, show.emoji || '🎫'),
    h('span', { class: 'poster__shine' })
  );
}
