// פס קבוע שמזכיר שזו אפליקציית אימון ושום דבר לא אמיתי.
import { h, icon } from '../../core/dom.js';
import { APP_TAGLINE } from '../../config/app-config.js';

export function demoBanner() {
  return h('div', { class: 'demo-banner', role: 'note' }, icon('info', 16), h('span', {}, APP_TAGLINE));
}
