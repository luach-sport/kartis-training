// כרטיס ברשימת "הכרטיסים שלי" — בצורת כרטיס הופעה עם חירור באמצע.
import { h } from '../../core/dom.js';
import { formatDate, formatTime, ticketsWord } from '../../core/format.js';
import { statusChip } from './status-chip.js';
import { toDate } from '../../core/format.js';

export function orderState(order, now = Date.now()) {
  if (order.status === 'cancelled') return 'cancelled';
  const d = toDate(order.startsAt);
  return d && d.getTime() <= now ? 'past' : 'paid';
}

export function ticketCard(order, onOpen) {
  const state = orderState(order);
  return h('button', { class: `ticket ticket--${state}`, onclick: () => onOpen(order) },
    h('div', { class: 'ticket__main' },
      h('div', { class: 'ticket__emoji', 'aria-hidden': 'true' }, order.emoji || '🎫'),
      h('div', { class: 'ticket__info' },
        h('h3', { class: 'ticket__title' }, order.showTitle),
        h('p', { class: 'ticket__line' }, `${formatDate(order.startsAt)} · ${formatTime(order.startsAt)}`),
        h('p', { class: 'ticket__line' }, `${order.venue}, ${order.city}`)
      )
    ),
    h('div', { class: 'ticket__stub' },
      h('span', { class: 'ticket__qty' }, ticketsWord(order.qty)),
      h('span', { class: 'ticket__section' }, order.sectionName),
      statusChip(state)
    )
  );
}
