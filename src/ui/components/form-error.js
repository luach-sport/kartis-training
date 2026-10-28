// אזור הודעה מעל כפתור השליחה (שגיאה או הצלחה).
import { h } from '../../core/dom.js';

export function formMessage() {
  const el = h('div', { class: 'form-msg', role: 'alert', hidden: true });
  return {
    el,
    error(text) { el.className = 'form-msg form-msg--error'; el.textContent = text; el.hidden = !text; },
    success(text) { el.className = 'form-msg form-msg--ok'; el.textContent = text; el.hidden = !text; },
    clear() { el.hidden = true; el.textContent = ''; }
  };
}
