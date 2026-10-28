// רשימת ההופעות — מתעדכנת בזמן אמת (כרטיסים שנמכרים במכשיר אחר מופיעים מיד).
import { h, mount, icon } from '../../../core/dom.js';
import { getState, displayName } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { watchShows } from '@services/shows-service.js';
import { describeError } from '../../../core/errors.js';
import { showStatus } from '../../../core/inventory.js';
import { showCard } from '../../components/show-card.js';
import { demoBanner } from '../../components/demo-banner.js';
import { verifyBanner } from '../../components/verify-banner.js';
import { spinner } from '../../components/spinner.js';
import { emptyState } from '../../components/empty-state.js';

function greeting() {
  const hour = new Date().getHours();
  const part = hour < 5 ? 'לילה טוב' : hour < 12 ? 'בוקר טוב' : hour < 18 ? 'צהריים טובים' : 'ערב טוב';
  const name = displayName().split(' ')[0];
  return name ? `${part}, ${name}` : part;
}

export function render(root) {
  const { user } = getState();
  const list = h('div', { class: 'show-list' }, spinner('טוען הופעות…'));
  const head = h('div', { class: 'list-head' },
    h('h2', { class: 'list-head__hello' }, greeting()),
    h('p', { class: 'muted' }, 'בחר הופעה, בחר מקומות — והכרטיס אצלך בכל המכשירים.')
  );

  mount(root, h('div', { class: 'page' }, demoBanner(), verifyBanner(user), head, list));

  const open = (show) => navigate(`/show/${encodeURIComponent(show.id)}`);

  return watchShows((shows) => {
    if (!shows.length) {
      mount(list, emptyState({
        iconName: 'stage',
        title: 'עדיין אין הופעות',
        text: getState().isAdmin
          ? 'אתה מנהל — אפשר לטעון הופעות לדוגמה ממסך הניהול.'
          : 'המנהל עוד לא טען הופעות. נסה שוב מאוחר יותר.',
        action: getState().isAdmin
          ? h('button', { class: 'btn btn--primary', onclick: () => navigate('/admin') }, icon('star', 18), 'למסך הניהול')
          : null
      }));
      return;
    }
    const upcoming = shows.filter((s) => showStatus(s) !== 'past');
    const past = shows.filter((s) => showStatus(s) === 'past');
    mount(list,
      upcoming.map((s) => showCard(s, open)),
      past.length ? h('h3', { class: 'list-sub' }, 'הופעות שכבר התקיימו') : null,
      past.map((s) => showCard(s, open))
    );
  }, (err) => {
    mount(list, emptyState({ iconName: 'wifiOff', title: 'לא הצלחנו לטעון הופעות', text: describeError(err) }));
  });
}
