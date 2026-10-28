// פרטי הופעה: בחירת אזור וכמות, וחישוב מחיר. המלאי מתעדכן חי בזמן שמסתכלים.
import { h, mount, icon } from '../../../core/dom.js';
import { navigate } from '../../../core/router.js';
import { watchShow } from '@services/shows-service.js';
import { describeError } from '../../../core/errors.js';
import { formatDateTime, formatPrice } from '../../../core/format.js';
import { sectionKeys, remaining, maxQty, showStatus } from '../../../core/inventory.js';
import { poster } from '../../components/poster.js';
import { statusChip } from '../../components/status-chip.js';
import { sectionPicker } from '../../components/section-picker.js';
import { qtyStepper } from '../../components/qty-stepper.js';
import { spinner } from '../../components/spinner.js';
import { emptyState } from '../../components/empty-state.js';

const CLOSED_TEXT = {
  soldout: 'כל הכרטיסים להופעה הזו נמכרו.',
  closed: 'המכירה להופעה הזו סגורה כרגע.',
  past: 'ההופעה הזו כבר התקיימה.'
};

export function render(root, { params, setTitle }) {
  let selected = null;
  let qty = 1;

  mount(root, h('div', { class: 'page' }, spinner()));

  const draw = (show) => {
    if (!show) {
      mount(root, emptyState({ iconName: 'stage', title: 'ההופעה לא נמצאה',
        action: h('button', { class: 'btn btn--primary', onclick: () => navigate('/shows') }, 'לכל ההופעות') }));
      return;
    }
    setTitle(show.title);
    const status = showStatus(show);
    const keys = sectionKeys(show);
    if (!selected || remaining(show, selected) === 0) selected = keys.find((k) => remaining(show, k) > 0) || keys[0];

    const total = h('strong', { class: 'buybar__total' });
    const buy = h('button', { class: 'btn btn--primary' }, 'להזמנה');
    const updateTotal = () => {
      const price = show.sections[selected]?.price || 0;
      total.textContent = formatPrice(price * qty);
    };

    const stepper = qtyStepper({ value: Math.min(qty, Math.max(1, maxQty(show, selected))), max: Math.max(1, maxQty(show, selected)),
      onChange: (v) => { qty = v; updateTotal(); } });
    const picker = sectionPicker(show, {
      selected,
      onSelect: (key) => {
        selected = key;
        picker.update(show, selected);
        stepper.setMax(Math.max(1, maxQty(show, key)));
        updateTotal();
      }
    });
    updateTotal();

    const canBuy = status === 'open' || status === 'low';
    buy.disabled = !canBuy;
    buy.addEventListener('click', () => navigate(`/checkout/${encodeURIComponent(show.id)}/${selected}/${qty}`));

    mount(root, h('div', { class: 'page page--with-bar' },
      poster(show, 'hero'),
      h('div', { class: 'detail' },
        h('div', { class: 'detail__chips' }, statusChip(status)),
        h('h2', { class: 'detail__title' }, show.title),
        h('p', { class: 'detail__artist' }, show.artist),
        h('p', { class: 'meta' }, icon('calendar', 18), formatDateTime(show.startsAt)),
        h('p', { class: 'meta' }, icon('pin', 18), `${show.venue}, ${show.city}`),
        show.description ? h('p', { class: 'detail__desc' }, show.description) : null
      ),
      canBuy
        ? h('section', { class: 'card' },
            h('h3', { class: 'card__title' }, 'איפה תרצה לשבת?'),
            picker.el,
            h('div', { class: 'qty-row' }, h('span', {}, 'כמות כרטיסים'), stepper.el)
          )
        : h('div', { class: 'notice' }, icon('info', 20), h('span', { class: 'notice__text' }, CLOSED_TEXT[status] || '')),
      canBuy
        ? h('div', { class: 'buybar' },
            h('div', {}, h('span', { class: 'buybar__label' }, 'סה"כ'), total),
            buy)
        : null
    ));
  };

  return watchShow(params.id, draw, (err) => {
    mount(root, emptyState({ iconName: 'wifiOff', title: 'לא הצלחנו לטעון', text: describeError(err) }));
  });
}
