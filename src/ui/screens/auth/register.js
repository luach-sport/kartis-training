// הרשמה: שם, מייל וסיסמה (עם מד חוזק), או ישר עם Google.
import { h, mount } from '../../../core/dom.js';
import { navigate } from '../../../core/router.js';
import { registerWithEmail, signInWithGoogle } from '@services/auth-service.js';
import { describeError, isCancel } from '../../../core/errors.js';
import { checkEmail, checkName, checkPassword, checkPasswordMatch } from '../../../core/validate.js';
import { withBusy } from '../../../core/busy.js';
import { field } from '../../components/field.js';
import { passwordField } from '../../components/password-field.js';
import { googleButton } from '../../components/google-button.js';
import { formMessage } from '../../components/form-error.js';
import { authHero, divider } from '../../components/auth-hero.js';

export function render(root) {
  const msg = formMessage();
  const name = field({ label: 'שם מלא', name: 'name', autocomplete: 'name', maxlength: 60 });
  const email = field({ label: 'מייל', name: 'email', type: 'email', autocomplete: 'email', inputmode: 'email', dir: 'ltr' });
  const password = passwordField({ autocomplete: 'new-password', meter: true, hint: 'לפחות 8 תווים, עם אותיות ומספרים' });
  const confirm = passwordField({ label: 'אימות סיסמה', name: 'confirm', autocomplete: 'new-password' });
  const submit = h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'יצירת חשבון');

  const onSubmit = async (e) => {
    e.preventDefault();
    msg.clear();
    const errors = [
      [name, checkName(name.value)],
      [email, checkEmail(email.value)],
      [password, checkPassword(password.value)],
      [confirm, checkPasswordMatch(password.value, confirm.value)]
    ];
    errors.forEach(([f, err]) => f.setError(err));
    if (errors.some(([, err]) => err)) return;

    await withBusy(submit, async () => {
      try {
        await registerWithEmail({ name: name.value.trim(), email: email.value, password: password.value });
        navigate('/verify', { replace: true });
      } catch (err) {
        msg.error(describeError(err));
      }
    }, 'יוצר חשבון…');
  };

  const google = googleButton(() => withBusy(google, async () => {
    msg.clear();
    try {
      await signInWithGoogle();
    } catch (err) {
      if (!isCancel(err)) msg.error(describeError(err));
    }
  }), 'הרשמה עם Google');

  mount(root, h('div', { class: 'auth' },
    authHero('חשבון אחד — הכרטיסים שלך בכל מכשיר'),
    google,
    divider('או הרשמה עם מייל'),
    h('form', { class: 'form', novalidate: true, onsubmit: onSubmit },
      name.el, email.el, password.el, confirm.el, msg.el, submit,
      h('p', { class: 'fine' }, 'אחרי ההרשמה נשלח אליך מייל אימות. רק אחרי האימות אפשר לקנות כרטיסים.')
    ),
    h('p', { class: 'auth__switch' }, 'כבר יש לך חשבון? ', h('a', { class: 'link', href: '#/login' }, 'לכניסה'))
  ));
}
