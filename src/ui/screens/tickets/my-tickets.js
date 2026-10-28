// "הכרטיסים שלי" — מגיעים מהענן ונשמרים גם במכשיר, אז נראים גם בלי אינטרנט.
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { watchOrders } from '@services/orders-service.js';
import { describeError } from '../../../core/errors.js';
import { toDate } from '../../../core/format.js';
import { ticketCard, orderState } from '../../components/ticket-card.js';
import { spinner } from '../../components/spinner.js';
import { emptyState } from '../../components/empty-state.js';

function group(title, orders, open) {
  if (!orders.length) return null;
  return h('section', { class: 'ticket-group' },
    h('h3', { class: 'list-sub' }, title),
    orders.map((o) => ticketCard(o, open))
  );
}

export function render(root) {
  const { user } = getState();
  const body = h('div', {}, spinner('טוען כרטיסים…'));
  const cacheNote = h('p', { class: 'fine center', hidden: true }, icon('wifiOff', 14), ' מוצגים הכרטיסים שנשמרו במכשיר');
  mount(root, h('div', { class: 'page' }, cacheNote, body));

  const open = (order) => navigate(`/ticket/${order.id}`);

  return watchOrders(user.uid, (orders, fromCache) => {
    cacheNote.hidden = !fromCache || navigator.onLine !== false;
    if (!orders.length) {
      mount(body, emptyState({
        iconName: 'ticket',
        title: 'עוד אין לך כרטיסים',
        text: 'כרטיסים שתקנה מכל מכשיר יופיעו כאן.',
        action: h('button', { class: 'btn btn--primary', onclick: () => navigate('/shows') }, 'לבחירת הופעה')
      }));
      return;
    }
    const byDate = (a, b) => (toDate(a.startsAt)?.getTime() || 0) - (toDate(b.startsAt)?.getTime() || 0);
    const upcoming = orders.filter((o) => orderState(o) === 'paid').sort(byDate);
    const past = orders.filter((o) => orderState(o) === 'past').sort(byDate).reverse();
    const cancelled = orders.filter((o) => orderState(o) === 'cancelled');
    mount(body,
      group('הופעות קרובות', upcoming, open),
      group('הופעות שהיו', past, open),
      group('הזמנות שבוטלו', cancelled, open)
    );
  }, (err) => {
    mount(body, emptyState({ iconName: 'wifiOff', title: 'לא הצלחנו לטעון', text: describeError(err) }));
  });
}
