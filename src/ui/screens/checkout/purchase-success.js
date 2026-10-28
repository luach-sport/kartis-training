// אחרי רכישה: אישור, וקיצור דרך לכרטיס.
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { watchOrder } from '@services/orders-service.js';
import { formatDateTime, ticketsWord } from '../../../core/format.js';
import { spinner } from '../../components/spinner.js';

export function render(root, { params }) {
  const { user } = getState();
  mount(root, h('div', { class: 'page' }, spinner()));

  return watchOrder(user.uid, params.orderId, (order) => {
    if (!order) {
      navigate('/tickets', { replace: true });
      return;
    }
    mount(root, h('div', { class: 'page center success' },
      h('div', { class: 'big-check big-check--pop' }, icon('check', 44)),
      h('h2', { class: 'page__title' }, 'ההזמנה הושלמה!'),
      h('p', { class: 'success__what' }, `${ticketsWord(order.qty)} ל${order.showTitle}`),
      h('p', { class: 'muted' }, formatDateTime(order.startsAt)),
      h('div', { class: 'notice notice--ok' }, icon('phone', 20),
        h('span', { class: 'notice__text' }, 'הכרטיסים נשמרו בחשבון שלך ויופיעו בכל מכשיר שתתחבר ממנו.')),
      h('div', { class: 'stack' },
        h('button', { class: 'btn btn--primary btn--block', onclick: () => navigate(`/ticket/${order.id}`, { replace: true }) }, icon('ticket', 20), 'הצגת הכרטיס'),
        h('button', { class: 'btn btn--ghost btn--block', onclick: () => navigate('/shows', { replace: true }) }, 'חזרה להופעות')
      )
    ));
  }, () => navigate('/tickets', { replace: true }));
}
