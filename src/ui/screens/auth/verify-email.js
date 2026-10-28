// אימות כתובת המייל: מראה לאן נשלח הקישור, בדיקה אם אומת, ושליחה חוזרת (עם המתנה בין שליחות).
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { toast } from '../../../core/toast.js';
import { resendVerification } from '@services/auth-service.js';
import { reloadUser, signOutHere } from '../../../app/session.js';
import { describeError } from '../../../core/errors.js';
import { withBusy } from '../../../core/busy.js';
import { RESEND_COOLDOWN_SECONDS } from '../../../config/app-config.js';
import { formMessage } from '../../components/form-error.js';

export function render(root) {
  const { user } = getState();
  if (user?.emailVerified) {
    mount(root, h('div', { class: 'page center' },
      h('div', { class: 'big-check' }, icon('check', 40)),
      h('h2', { class: 'page__title' }, 'המייל שלך מאומת'),
      h('p', { class: 'muted' }, 'אפשר לקנות כרטיסים.'),
      h('button', { class: 'btn btn--primary', onclick: () => navigate('/shows') }, 'להופעות')
    ));
    return undefined;
  }

  const msg = formMessage();
  let timer = null;
  let left = 0;

  const check = h('button', { class: 'btn btn--primary btn--block' }, 'אימתתי — בדיקה');
  const resend = h('button', { class: 'btn btn--ghost btn--block' }, 'שליחה חוזרת של המייל');

  const tick = () => {
    left -= 1;
    resend.disabled = left > 0;
    resend.textContent = left > 0 ? `אפשר לשלוח שוב בעוד ${left} שניות` : 'שליחה חוזרת של המייל';
    if (left <= 0) clearInterval(timer);
  };
  const startCooldown = () => {
    left = RESEND_COOLDOWN_SECONDS + 1;
    clearInterval(timer);
    tick();
    timer = setInterval(tick, 1000);
  };

  check.addEventListener('click', () => withBusy(check, async () => {
    msg.clear();
    try {
      const fresh = await reloadUser();
      if (fresh?.emailVerified) {
        toast('המייל אומת! אפשר לקנות כרטיסים.', 'ok');
        navigate('/shows', { replace: true });
      } else {
        msg.error('עוד לא רואים אימות. לחץ על הקישור במייל ונסה שוב.');
      }
    } catch (err) {
      msg.error(describeError(err));
    }
  }, 'בודק…'));

  resend.addEventListener('click', async () => {
    msg.clear();
    try {
      await resendVerification();
      msg.success('שלחנו שוב. כדאי לבדוק גם בתיקיית הספאם.');
      startCooldown();
    } catch (err) {
      msg.error(describeError(err));
    }
  });

  mount(root, h('div', { class: 'page' },
    h('div', { class: 'hero-icon' }, icon('mail', 40)),
    h('h2', { class: 'page__title center' }, 'בדוק את תיבת המייל'),
    h('p', { class: 'muted center' }, 'שלחנו קישור אימות אל'),
    h('p', { class: 'email-pill', dir: 'ltr' }, user?.email || ''),
    h('ol', { class: 'steps' },
      h('li', {}, 'פתח את המייל מ"כרטיס" (אם אין — בדוק בספאם).'),
      h('li', {}, 'לחץ על הקישור שבמייל.'),
      h('li', {}, 'חזור לכאן ולחץ "אימתתי — בדיקה".')
    ),
    msg.el,
    h('div', { class: 'stack' }, check, resend,
      h('button', { class: 'btn btn--text', onclick: () => signOutHere() }, 'התנתקות / כניסה עם חשבון אחר')
    ),
    h('p', { class: 'fine' }, 'למה צריך את זה? כך מוודאים שהמייל באמת שלך, כי דרכו מאפסים סיסמה אם שוכחים אותה.')
  ));

  return () => clearInterval(timer);
}
