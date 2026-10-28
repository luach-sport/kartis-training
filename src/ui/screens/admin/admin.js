// מסך ניהול: רק למי שרשום כמנהל (admins/{uid} בקונסולה). השרת בודק את זה בכל כתיבה.
import { h, mount, icon } from '../../../core/dom.js';
import { getState, subscribe } from '../../../core/store.js';
import { toast } from '../../../core/toast.js';
import { copyText } from '../../../core/clipboard.js';
import { watchShows } from '@services/shows-service.js';
import { seedSampleShows, setShowActive } from '@services/admin-service.js';
import { describeError } from '../../../core/errors.js';
import { formatShortDate } from '../../../core/format.js';
import { totalCapacity, totalRemaining } from '../../../core/inventory.js';
import { withBusy } from '../../../core/busy.js';
import { SAMPLE_SHOWS } from '../../../data/sample-shows.js';
import { spinner } from '../../components/spinner.js';

function notAdmin(root, uid) {
  mount(root, h('div', { class: 'page' },
    h('div', { class: 'hero-icon' }, icon('lock', 36)),
    h('h2', { class: 'page__title center' }, 'המסך הזה למנהלים בלבד'),
    h('p', { class: 'muted center' }, 'כדי להפוך למנהל: בקונסולה של Firebase ← Firestore, יוצרים אוסף admins ובו מסמך שהמזהה שלו הוא ה-UID שלך.'),
    h('button', { class: 'btn btn--ghost btn--block', onclick: async () => toast(await copyText(uid) ? 'המזהה הועתק' : 'לא הצלחנו להעתיק', 'ok') },
      icon('copy', 18), 'העתקת ה-UID שלי')
  ));
}

function showRow(show) {
  const sold = totalCapacity(show) - totalRemaining(show);
  const toggle = h('button', { class: `btn btn--small ${show.active ? 'btn--ghost' : 'btn--primary'}` }, show.active ? 'סגירת מכירה' : 'פתיחת מכירה');
  toggle.addEventListener('click', () => withBusy(toggle, async () => {
    try {
      await setShowActive(show.id, !show.active);
    } catch (err) {
      toast(describeError(err), 'error');
    }
  }));
  return h('div', { class: 'admin-show' },
    h('span', { class: 'admin-show__emoji', 'aria-hidden': 'true' }, show.emoji),
    h('div', { class: 'admin-show__text' },
      h('strong', {}, show.title),
      h('span', { class: 'muted' }, `${formatShortDate(show.startsAt)} · נמכרו ${sold} מתוך ${totalCapacity(show)}`)
    ),
    toggle
  );
}

export function render(root) {
  const { user } = getState();
  let stopShows = null;

  const draw = (state) => {
    stopShows?.();
    stopShows = null;
    if (!state.isAdmin) {
      notAdmin(root, user.uid);
      return;
    }
    const list = h('div', { class: 'admin-list' }, spinner());
    const seed = h('button', { class: 'btn btn--primary btn--block' }, icon('plus', 18), `טעינת ${SAMPLE_SHOWS.length} הופעות לדוגמה`);
    seed.addEventListener('click', () => withBusy(seed, async () => {
      try {
        const added = await seedSampleShows();
        toast(added ? `נוספו ${added} הופעות` : 'כל ההופעות לדוגמה כבר קיימות', 'ok');
      } catch (err) {
        toast(describeError(err), 'error');
      }
    }, 'טוען…'));

    mount(root, h('div', { class: 'page' },
      h('section', { class: 'card' },
        h('h3', { class: 'card__title' }, 'הופעות לדוגמה'),
        h('p', { class: 'muted' }, 'מוסיף הופעות דמיוניות בתאריכים הקרובים. הופעה שכבר קיימת לא משתנה.'),
        seed
      ),
      h('h3', { class: 'list-sub' }, 'כל ההופעות'),
      list
    ));

    stopShows = watchShows((shows) => {
      mount(list, shows.length ? shows.map(showRow) : h('p', { class: 'muted' }, 'אין עדיין הופעות.'));
    }, (err) => mount(list, h('p', { class: 'form-msg form-msg--error' }, describeError(err))));
  };

  let lastAdmin = null;
  const onState = (state) => {
    if (state.isAdmin === lastAdmin) return;
    lastAdmin = state.isAdmin;
    draw(state);
  };
  onState(getState());
  const stopStore = subscribe(onState);
  return () => { stopStore(); stopShows?.(); };
}
