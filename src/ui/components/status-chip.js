import { h } from '../../core/dom.js';

const LABELS = {
  open: 'במכירה',
  low: 'כמעט אזל',
  soldout: 'אזל',
  closed: 'המכירה סגורה',
  past: 'התקיימה',
  paid: 'בתוקף',
  cancelled: 'בוטל'
};

export function statusChip(status) {
  return h('span', { class: `chip chip--${status}` }, LABELS[status] || status);
}
