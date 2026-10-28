// כרטיס בודד: ברקוד, פרטים, וביטול (עד ההופעה).
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { toast } from '../../../core/toast.js';
import { confirmDialog } from '../../../core/dialog.js';
import { watchOrder, cancelOrder } from '@services/orders-service.js';
import { describeError } from '../../../core/errors.js';
import { formatDateTime, formatPrice, formatShortDate, ticketsWord } from '../../../core/format.js';
import { formatTicketCode } from '../../../core/ticket-code.js';
import { withBusy } from '../../../core/busy.js';
import { orderState } from '../../components/ticket-card.js';
import { statusChip } from '../../components/status-chip.js';
import { qrCode } from '../../components/qr-code.js';
import { spinner } from '../../components/spinner.js';
import { emptyState } from '../../components/empty-state.js';

function infoRow(label, value) {
  return h('div', { class: 'big-ticket__row' }, h('span', {}, label), h('strong', {}, value));
}

export function render(root, { params, setTitle }) {
  const { user } = getState();
  mount(root, h('div', { class: 'page' }, spinner()));

  return watchOrder(user.uid, params.id, (order) => {
    if (!order) {
      mount(root, emptyState({ iconName: 'ticket', title: 'הכרטיס לא נמצא',
        action: h('button', { class: 'btn btn--primary', onclick: () => navigate('/tickets') }, 'לכרטיסים שלי') }));
      return;
    }
    setTitle(order.showTitle);
    const state = orderState(order);

    const cancelBtn = h('button', { class: 'btn btn--danger-ghost btn--block' }, icon('trash', 18), 'ביטול ההזמנה');
    cancelBtn.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: 'לבטל את ההזמנה?',
        message: `${ticketsWord(order.qty)} יחזרו למכירה. (באימון אין החזר כספי — כי לא שולם כלום.)`,
        confirmText: 'כן, לבטל',
        cancelText: 'לא',
        danger: true
      });
      if (!ok) return;
      await withBusy(cancelBtn, async () => {
        try {
          await cancelOrder(user.uid, order.id);
          toast('ההזמנה בוטלה', 'ok');
        } catch (err) {
          toast(describeError(err), 'error', 4500);
        }
      }, 'מבטל…');
    });

    mount(root, h('div', { class: 'page' },
      h('article', { class: `big-ticket big-ticket--${state}` },
        h('header', { class: 'big-ticket__head' },
          h('span', { class: 'big-ticket__emoji', 'aria-hidden': 'true' }, order.emoji || '🎫'),
          h('div', {},
            h('h2', { class: 'big-ticket__title' }, order.showTitle),
            h('p', { class: 'big-ticket__when' }, formatDateTime(order.startsAt))
          ),
          statusChip(state)
        ),
        h('div', { class: 'big-ticket__qr' },
          state === 'cancelled'
            ? h('div', { class: 'big-ticket__void' }, 'הכרטיס בוטל')
            : qrCode(`KARTIS|${order.id}|${order.code}`),
          h('p', { class: 'big-ticket__code', dir: 'ltr' }, formatTicketCode(order.code))
        ),
        h('div', { class: 'big-ticket__perf', 'aria-hidden': 'true' }),
        h('div', { class: 'big-ticket__rows' },
          infoRow('מקום', `${order.venue}, ${order.city}`),
          infoRow('אזור', order.sectionName),
          infoRow('כמות', ticketsWord(order.qty)),
          infoRow('שולם (מדומה)', formatPrice(order.total)),
          infoRow('הוזמן ב', formatShortDate(order.createdAt))
        )
      ),
      h('p', { class: 'fine center' }, icon('phone', 14), ' הכרטיס הזה מסונכרן לכל המכשירים שמחוברים לחשבון שלך'),
      state === 'paid' ? cancelBtn : null
    ));
  }, (err) => {
    mount(root, emptyState({ iconName: 'wifiOff', title: 'לא הצלחנו לטעון', text: describeError(err) }));
  });
}
