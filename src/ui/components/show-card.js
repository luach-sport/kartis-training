// כרטיסייה של הופעה ברשימה: פוסטר, שם, תאריך, מקום, מחיר ומלאי.
import { h, icon } from '../../core/dom.js';
import { formatDate, formatTime, formatPrice } from '../../core/format.js';
import { showStatus, totalRemaining, totalCapacity, lowestPrice } from '../../core/inventory.js';
import { poster } from './poster.js';
import { statusChip } from './status-chip.js';

export function availabilityBar(show) {
  const cap = totalCapacity(show) || 1;
  const soldPct = Math.round(((cap - totalRemaining(show)) / cap) * 100);
  return h('div', { class: 'avail', title: `נמכרו ${soldPct}%` },
    h('div', { class: 'avail__fill', style: { width: `${soldPct}%` } })
  );
}

export function showCard(show, onOpen) {
  const status = showStatus(show);
  const left = totalRemaining(show);
  return h('button', { class: `show-card show-card--${status}`, onclick: () => onOpen(show) },
    poster(show, 'card'),
    h('div', { class: 'show-card__body' },
      h('div', { class: 'show-card__top' },
        statusChip(status),
        h('span', { class: 'show-card__price' }, `מ-${formatPrice(lowestPrice(show))}`)
      ),
      h('h3', { class: 'show-card__title' }, show.title),
      h('p', { class: 'show-card__artist' }, show.artist),
      h('p', { class: 'meta' }, icon('calendar', 16), `${formatDate(show.startsAt)} · ${formatTime(show.startsAt)}`),
      h('p', { class: 'meta' }, icon('pin', 16), `${show.venue}, ${show.city}`),
      status === 'open' || status === 'low'
        ? h('div', { class: 'show-card__stock' },
            availabilityBar(show),
            h('span', { class: 'show-card__left' }, left <= 20 ? `נשארו ${left}` : `${left} פנויים`))
        : null
    )
  );
}
