// מחיקת חשבון: אישור זהות מחדש, ואז מחיקה של כל הנתונים בענן ושל החשבון עצמו.
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { toast } from '../../../core/toast.js';
import { confirmDialog } from '../../../core/dialog.js';
import { reauthenticate } from '@services/auth-service.js';
import { deleteAccountEverywhere } from '@services/account-service.js';
import { prepareForAccountDeletion } from '../../../app/session.js';
import { describeError, isCancel } from '../../../core/errors.js';
import { isOnline } from '../../../core/net-status.js';
import { withBusy } from '../../../core/busy.js';
import { passwordField } from '../../components/password-field.js';
import { formMessage } from '../../components/form-error.js';

export function render(root) {
  const { user } = getState();
  const msg = formMessage();
  const usePassword = user.hasPassword;
  const password = usePassword ? passwordField({ label: 'הסיסמה שלך (לאישור)', autocomplete: 'current-password' }) : null;
  const agree = h('input', { type: 'checkbox', id: 'agree', class: 'check' });
  const del = h('button', { class: 'btn btn--danger btn--block', disabled: true }, icon('trash', 18), 'מחיקת החשבון לצמיתות');
  agree.addEventListener('change', () => { del.disabled = !agree.checked; });

  del.addEventListener('click', async () => {
    msg.clear();
    if (!isOnline()) {
      msg.error('מחיקת חשבון צריכה חיבור לאינטרנט.');
      return;
    }
    if (usePassword && !password.value) {
      password.setError('צריך להקליד את הסיסמה כדי לאשר שזה אתה.');
      return;
    }
    const ok = await confirmDialog({
      title: 'למחוק את החשבון?',
      message: 'אין דרך לשחזר אותו. כל הכרטיסים, הפרטים והמכשירים יימחקו.',
      confirmText: 'מחיקה סופית',
      danger: true
    });
    if (!ok) return;
    await withBusy(del, async () => {
      try {
        await reauthenticate({ password: password?.value });
        prepareForAccountDeletion();
        await deleteAccountEverywhere(user.uid);
        toast('החשבון נמחק. להתראות!', 'ok', 4500);
      } catch (err) {
        if (!isCancel(err)) msg.error(describeError(err));
      }
    }, 'מוחק…');
  });

  mount(root, h('div', { class: 'page' },
    h('section', { class: 'card card--danger' },
      h('h2', { class: 'card__title' }, 'מה יימחק'),
      h('ul', { class: 'tips' },
        h('li', {}, 'כל הכרטיסים וההזמנות שלך'),
        h('li', {}, 'הפרטים האישיים (שם, טלפון, עיר)'),
        h('li', {}, 'רשימת המכשירים — כולם יתנתקו'),
        h('li', {}, 'החשבון עצמו. אפשר להירשם מחדש, אבל בתור חשבון חדש וריק.')
      )
    ),
    h('div', { class: 'form' },
      password ? password.el : h('p', { class: 'muted' }, 'לאישור שזה אתה, ייפתח חלון בחירת חשבון Google.'),
      h('label', { class: 'check-row', for: 'agree' }, agree, h('span', {}, 'אני מבין שהמחיקה סופית')),
      msg.el,
      del
    )
  ));
}
