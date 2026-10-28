// המכשירים שמחוברים לחשבון. הסרת מכשיר מנתקת אותו (ברגע שהוא מחובר לאינטרנט).
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { toast } from '../../../core/toast.js';
import { confirmDialog } from '../../../core/dialog.js';
import { watchDevices, removeDevice, thisDeviceId } from '@services/devices-service.js';
import { describeError } from '../../../core/errors.js';
import { formatAgo, formatShortDate } from '../../../core/format.js';
import { platformLabel } from '../../../core/platform.js';
import { spinner } from '../../components/spinner.js';

function deviceRow(device, isThis, onRemove) {
  return h('div', { class: `device${isThis ? ' device--this' : ''}` },
    h('span', { class: 'device__icon' }, icon(device.platform === 'web' ? 'laptop' : 'phone', 24)),
    h('div', { class: 'device__text' },
      h('strong', {}, device.name),
      h('span', { class: 'muted' }, `${platformLabel(device.platform)} · גרסה ${device.appVersion}`),
      h('span', { class: 'muted' }, isThis ? 'המכשיר הזה · פעיל עכשיו' : `פעיל ${formatAgo(device.lastSeen)} · מחובר מ-${formatShortDate(device.createdAt)}`)
    ),
    isThis
      ? h('span', { class: 'chip chip--paid' }, 'המכשיר הזה')
      : h('button', { class: 'btn btn--small btn--danger-ghost', onclick: () => onRemove(device) }, 'ניתוק')
  );
}

export function render(root) {
  const { user } = getState();
  const myId = thisDeviceId();
  const list = h('div', { class: 'devices' }, spinner());
  const removeAll = h('button', { class: 'btn btn--danger-ghost btn--block', hidden: true }, 'ניתוק כל המכשירים האחרים');
  let others = [];

  const remove = async (device) => {
    const ok = await confirmDialog({
      title: `לנתק את ${device.name}?`,
      message: 'המכשיר יתנתק מהחשבון ברגע שיהיה מחובר לאינטרנט. כדי להיכנס שוב יצטרכו להתחבר מחדש.',
      confirmText: 'ניתוק', danger: true
    });
    if (!ok) return;
    try {
      await removeDevice(user.uid, device.id);
      toast('המכשיר נותק', 'ok');
    } catch (err) {
      toast(describeError(err), 'error');
    }
  };

  removeAll.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'לנתק את כל המכשירים האחרים?',
      message: 'שימושי אם איבדת טלפון או התחברת ממכשיר של מישהו אחר. המכשיר הזה נשאר מחובר.',
      confirmText: 'ניתוק כולם', danger: true
    });
    if (!ok) return;
    try {
      await Promise.all(others.map((d) => removeDevice(user.uid, d.id)));
      toast('כל המכשירים האחרים נותקו', 'ok');
    } catch (err) {
      toast(describeError(err), 'error');
    }
  });

  mount(root, h('div', { class: 'page' },
    h('p', { class: 'muted' }, 'כל מכשיר שמתחבר לחשבון מופיע כאן. הכרטיסים והפרטים שלך מסונכרנים בין כולם.'),
    list,
    removeAll,
    h('p', { class: 'fine' }, 'שים לב: זו אפליקציית אימון. באפליקציה אמיתית מוסיפים גם ניתוק בצד השרת (ביטול האסימונים של המכשיר).')
  ));

  return watchDevices(user.uid, (devices) => {
    others = devices.filter((d) => d.id !== myId);
    const mine = devices.filter((d) => d.id === myId);
    removeAll.hidden = others.length === 0;
    mount(list, [...mine, ...others].map((d) => deviceRow(d, d.id === myId, remove)));
  }, (err) => mount(list, h('p', { class: 'form-msg form-msg--error' }, describeError(err))));
}
