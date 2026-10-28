// מסך כניסה: Google, או מייל וסיסמה.
import { h, mount } from '../../../core/dom.js';
import { signInWithEmail, signInWithGoogle } from '@services/auth-service.js';
import { describeError, isCancel } from '../../../core/errors.js';
import { checkEmail } from '../../../core/validate.js';
import { withBusy } from '../../../core/busy.js';
import { field } from '../../components/field.js';
import { passwordField } from '../../components/password-field.js';
import { googleButton } from '../../components/google-button.js';
import { formMessage } from '../../components/form-error.js';
import { demoBanner } from '../../components/demo-banner.js';
import { authHero, divider } from '../../components/auth-hero.js';

export function render(root) {
  const msg = formMessage();
  const email = field({ label: 'מייל', name: 'email', type: 'email', autocomplete: 'email', inputmode: 'email', dir: 'ltr' });
  const password = passwordField();
  const submit = h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'כניסה');

  const onSubmit = async (e) => {
    e.preventDefault();
    msg.clear();
    const emailError = checkEmail(email.value);
    email.setError(emailError);
    password.setError(password.value ? '' : 'צריך למלא סיסמה.');
    if (emailError || !password.value) return;
    await withBusy(submit, async () => {
      try {
        await signInWithEmail(email.value, password.value);
      } catch (err) {
        msg.error(describeError(err));
      }
    }, 'נכנס…');
  };

  const google = googleButton(() => withBusy(google, async () => {
    msg.clear();
    try {
      await signInWithGoogle();
    } catch (err) {
      if (!isCancel(err)) msg.error(describeError(err));
    }
  }));

  mount(root, h('div', { class: 'auth' },
    authHero('כרטיסים להופעות — בלחיצה אחת, מכל מכשיר'),
    demoBanner(),
    google,
    divider('או עם מייל וסיסמה'),
    h('form', { class: 'form', novalidate: true, onsubmit: onSubmit },
      email.el,
      password.el,
      h('a', { class: 'link link--end', href: '#/forgot' }, 'שכחתי סיסמה'),
      msg.el,
      submit
    ),
    h('p', { class: 'auth__switch' }, 'אין לך חשבון? ', h('a', { class: 'link', href: '#/register' }, 'להרשמה'))
  ));
}
