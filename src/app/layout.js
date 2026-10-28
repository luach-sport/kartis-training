// מסגרת קבועה: כותרת עליונה עם "חזרה", אזור תוכן, ולשוניות למטה.
// בכל מעבר מסך מנקים את המסך הקודם (מפסיקים האזנות לענן) ומציירים את החדש.
import { h, icon, mount } from '../core/dom.js';
import { goBack, navigate } from '../core/router.js';
import { subscribe, getState } from '../core/store.js';

let shell = null;
let titleEl;
let backBtn;
let content;
let offlinePill;
let tabs = {};
let backTo = '/shows';
let cleanup = null;

function tabButton(key, label, iconName, path) {
  const btn = h('button', { class: 'tab', onclick: () => navigate(path) }, icon(iconName, 24), h('span', {}, label));
  tabs[key] = btn;
  return btn;
}

function buildShell(root) {
  backBtn = h('button', { class: 'topbar__back', 'aria-label': 'חזרה', onclick: () => goBack(backTo) }, icon('back', 24));
  titleEl = h('h1', { class: 'topbar__title' });
  offlinePill = h('span', { class: 'offline-pill', hidden: true }, icon('wifiOff', 14), 'בלי חיבור');
  content = h('main', { class: 'content', id: 'content' });
  shell = h('div', { class: 'shell' },
    h('header', { class: 'topbar' }, backBtn, titleEl, offlinePill),
    content,
    h('nav', { class: 'tabbar', 'aria-label': 'ניווט ראשי' },
      tabButton('shows', 'הופעות', 'stage', '/shows'),
      tabButton('tickets', 'הכרטיסים שלי', 'ticket', '/tickets'),
      tabButton('account', 'חשבון', 'user', '/account')
    )
  );
  mount(root, shell);
  const syncOnline = (s) => { offlinePill.hidden = s.online; };
  subscribe(syncOnline);
  syncOnline(getState());
}

export function runCleanup() {
  if (cleanup) {
    try { cleanup(); } catch { /* ignore */ }
  }
  cleanup = null;
}

export function renderRoute(root, { route, params }) {
  if (!shell || !root.contains(shell)) buildShell(root);
  runCleanup();

  shell.classList.toggle('shell--bare', Boolean(route.bare));
  titleEl.textContent = route.title || '';
  backBtn.hidden = !route.backTo;
  backTo = route.backTo || '/shows';
  for (const [key, btn] of Object.entries(tabs)) {
    const on = key === route.tab;
    btn.classList.toggle('is-on', on);
    if (on) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }

  content.replaceChildren();
  content.scrollTop = 0;
  const ctx = { params, setTitle: (t) => { titleEl.textContent = t; } };
  const result = route.screen.render(content, ctx);
  cleanup = typeof result === 'function' ? result : null;
}

export function renderSplash(root) {
  runCleanup();
  shell = null;
  mount(root, h('div', { class: 'splash' },
    h('div', { class: 'splash__logo', 'aria-hidden': 'true' }, '🎟️'),
    h('div', { class: 'splash__name' }, 'כרטיס')
  ));
}
