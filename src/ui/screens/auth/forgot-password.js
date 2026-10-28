// שכחתי סיסמה: שולחים למייל קישור לבחירת סיסמה חדשה.
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { goBack } from '../../../core/router.js';
import { sendPasswordReset } from '@services/auth-service.js';
import { describeError } from '../../../core/errors.js';
import { checkEmail } from '../../../core/validate.js';
import { withBusy } from '../../../core/busy.js';
import { field } from '../../components/field.js';
import { formMessage } from '../../components/form-error.js';

export function render(root) {
  const { user } = getState();
  const msg = formMessage();
  const email = field({
    label: 'המייל של החשבון', name: 'email', type: 'email', autocomplete: 'email',
    inputmode: 'email', dir: 'ltr', value: user?.email || ''
  });
  const submit = h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'שליחת קישור לאיפוס');

  const onSubmit = async (e) => {
    e.preventDefault();
    msg.clear();
    const error = checkEmail(email.value);
    email.setError(error);
    if (error) return;
    await withBusy(submit, async () => {
      try {
        await sendPasswordReset(email.value);
        // הודעה זהה בין אם יש חשבון ובין אם אין — כדי שאי אפשר יהיה לבדוק מי רשום.
        msg.success('אם יש חשבון עם המייל הזה, שלחנו אליו עכשיו קישור לבחירת סיסמה חדשה. כדאי לבדוק גם בתיקיית הספאם.');
      } catch (err) {
        msg.error(describeError(err));
      }
    }, 'שולח…');
  };

  mount(root, h('div', { class: 'auth' },
    h('button', { class: 'auth__back', type: 'button', onclick: () => goBack(user ? '/account/security' : '/login') }, icon('back', 20), 'חזרה'),
    h('div', { class: 'auth-hero auth-hero--small' },
      h('div', { class: 'auth-hero__logo', 'aria-hidden': 'true' }, icon('lock', 34)),
      h('h1', { class: 'auth-hero__name' }, 'איפוס סיסמה'),
      h('p', { class: 'auth-hero__sub' }, 'נשלח לך קישור. בלחיצה עליו בוחרים סיסמה חדשה, ואז חוזרים לכאן ונכנסים.')
    ),
    h('form', { class: 'form', novalidate: true, onsubmit: onSubmit }, email.el, msg.el, submit),
    h('p', { class: 'fine' }, 'נרשמת עם Google? אין לך סיסמה אצלנו — פשוט לוחצים "המשך עם Google".')
  ));
}
