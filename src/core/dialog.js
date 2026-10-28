// חלון אישור משלנו (חלונות הדפדפן הרגילים נראים רע באנדרואיד וחוסמים את האפליקציה).
import { h } from './dom.js';

export function confirmDialog({ title, message, confirmText = 'אישור', cancelText = 'ביטול', danger = false }) {
  return new Promise((resolve) => {
    const close = (result) => {
      overlay.classList.remove('is-in');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => overlay.remove(), 200);
      resolve(result);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(false); };

    const overlay = h('div', { class: 'dialog-overlay', onclick: (e) => { if (e.target === overlay) close(false); } },
      h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('h2', { class: 'dialog__title' }, title),
        message ? h('p', { class: 'dialog__text' }, message) : null,
        h('div', { class: 'dialog__actions' },
          h('button', { class: `btn ${danger ? 'btn--danger' : 'btn--primary'}`, onclick: () => close(true) }, confirmText),
          h('button', { class: 'btn btn--ghost', onclick: () => close(false) }, cancelText)
        )
      )
    );
    document.body.append(overlay);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => overlay.classList.add('is-in'));
  });
}
