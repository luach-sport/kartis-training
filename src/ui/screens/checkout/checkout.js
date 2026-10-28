// השלמת הזמנה: סיכום, פרטי הקונה ו"תשלום" מדומה. שום פרט אשראי לא נאסף.
import { h, mount, icon } from '../../../core/dom.js';
import { getState, displayName } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { watchShow } from '@services/shows-service.js';
import { purchase } from '@services/orders-service.js';
import { describeError } from '../../../core/errors.js';
import { formatDateTime, formatPrice, ticketsWord } from '../../../core/format.js';
import { purchaseProblem } from '../../../core/inventory.js';
import { withBusy } from '../../../core/busy.js';
import { formMessage } from '../../components/form-error.js';
import { spinner } from '../../components/spinner.js';
import { emptyState } from '../../components/empty-state.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function summaryRow(label, value) {
  return h('div', { class: 'sum-row' }, h('span', {}, label), h('span', {}, value));
}

export function render(root, { params }) {
  const qty = Number.parseInt(params.qty, 10);
  const sectionKey = params.section;
  let paying = false;

  mount(root, h('div', { class: 'page' }, spinner()));

  const draw = (show) => {
    if (paying) return; // לא מציירים מחדש באמצע תשלום
    const { user } = getState();
    if (!show) {
      mount(root, emptyState({ iconName: 'stage', title: 'ההופעה לא נמצאה' }));
      return;
    }
    const problem = purchaseProblem(show, sectionKey, qty);
    if (problem) {
      mount(root, emptyState({
        iconName: 'ticket',
        title: 'אי אפשר להשלים את ההזמנה',
        text: describeError({ code: problem }),
        action: h('button', { class: 'btn btn--primary', onclick: () => navigate(`/show/${encodeURIComponent(show.id)}`, { replace: true }) }, 'חזרה לבחירת מקומות')
      }));
      return;
    }

    const section = show.sections[sectionKey];
    const msg = formMessage();
    const pay = h('button', { class: 'btn btn--primary btn--block btn--big' }, icon('lock', 20), `אישור ותשלום ${formatPrice(section.price * qty)}`);

    if (!user.emailVerified) {
      pay.disabled = true;
      msg.error('כדי לקנות צריך קודם לאמת את כתובת המייל.');
    }

    pay.addEventListener('click', () => withBusy(pay, async () => {
      msg.clear();
      paying = true;
      try {
        await wait(700); // "עיבוד תשלום" — רק כדי שירגיש אמיתי
        const orderId = await purchase({ uid: user.uid, showId: show.id, sectionKey, qty });
        navigate(`/success/${orderId}`, { replace: true });
      } catch (err) {
        paying = false;
        msg.error(describeError(err));
      }
    }, 'מעבד תשלום מדומה…'));

    mount(root, h('div', { class: 'page' },
      h('section', { class: 'card' },
        h('div', { class: 'checkout-head' },
          h('span', { class: 'checkout-head__emoji', 'aria-hidden': 'true' }, show.emoji),
          h('div', {},
            h('h2', { class: 'card__title' }, show.title),
            h('p', { class: 'muted' }, formatDateTime(show.startsAt)),
            h('p', { class: 'muted' }, `${show.venue}, ${show.city}`)
          )
        ),
        h('div', { class: 'sum' },
          summaryRow('אזור', section.name),
          summaryRow('כמות', ticketsWord(qty)),
          summaryRow('מחיר לכרטיס', formatPrice(section.price)),
          h('div', { class: 'sum-row sum-row--total' }, h('span', {}, 'לתשלום'), h('strong', {}, formatPrice(section.price * qty)))
        )
      ),
      h('section', { class: 'card' },
        h('h3', { class: 'card__title' }, 'הכרטיסים יישמרו בחשבון של'),
        h('p', {}, displayName()),
        h('p', { class: 'muted', dir: 'ltr' }, user.email)
      ),
      h('section', { class: 'card card--demo' },
        h('div', { class: 'demo-pay' },
          h('span', { class: 'demo-pay__icon' }, icon('shield', 26)),
          h('div', {},
            h('strong', {}, 'תשלום מדומה'),
            h('p', { class: 'muted' }, 'זו אפליקציית אימון: לא מתבצע חיוב, ולא צריך ולא נאסף שום פרט של כרטיס אשראי.')
          )
        )
      ),
      msg.el,
      !user.emailVerified ? h('button', { class: 'btn btn--ghost btn--block', onclick: () => navigate('/verify') }, 'לאימות המייל') : null,
      pay
    ));
  };

  return watchShow(params.id, draw, (err) => {
    if (!paying) mount(root, emptyState({ iconName: 'wifiOff', title: 'לא הצלחנו לטעון', text: describeError(err) }));
  });
}
