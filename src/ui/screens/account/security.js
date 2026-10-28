// אבטחה והתחברות: איך מתחברים, מצב אימות המייל, ושינוי סיסמה דרך המייל.
import { h, mount, icon } from '../../../core/dom.js';
import { getState } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { toast } from '../../../core/toast.js';
import { sendPasswordReset } from '@services/auth-service.js';
import { describeError } from '../../../core/errors.js';
import { listRow, rowGroup } from '../../components/list-row.js';

export function render(root) {
  const { user } = getState();

  const resetRow = listRow({
    iconName: 'lock',
    title: 'שינוי סיסמה',
    subtitle: 'נשלח אליך מייל עם קישור לבחירת סיסמה חדשה',
    onClick: async () => {
      try {
        await sendPasswordReset(user.email);
        toast('שלחנו מייל לשינוי הסיסמה', 'ok', 4500);
      } catch (err) {
        toast(describeError(err), 'error');
      }
    }
  });

  mount(root, h('div', { class: 'page' },
    rowGroup('דרך ההתחברות',
      listRow({
        iconName: user.provider === 'google' ? 'user' : 'mail',
        title: user.provider === 'google' ? 'חשבון Google' : 'מייל וסיסמה',
        subtitle: user.email
      }),
      listRow({
        iconName: user.emailVerified ? 'check' : 'mail',
        title: user.emailVerified ? 'המייל מאומת' : 'המייל עוד לא מאומת',
        subtitle: user.emailVerified ? 'אפשר לקנות כרטיסים ולאפס סיסמה דרכו' : 'לחץ לאימות — בלי זה אי אפשר לקנות',
        onClick: user.emailVerified ? undefined : () => navigate('/verify')
      })
    ),
    user.hasPassword ? rowGroup('סיסמה', resetRow) : null,
    rowGroup('מכשירים',
      listRow({ iconName: 'phone', title: 'ניתוק מכשירים אחרים', subtitle: 'איבדת טלפון? נתק אותו מהחשבון', onClick: () => navigate('/account/devices') })
    ),
    h('section', { class: 'card card--tips' },
      h('h3', { class: 'card__title' }, icon('shield', 20), ' איך החשבון שלך מוגן'),
      h('ul', { class: 'tips' },
        h('li', {}, 'הסיסמה לא נשמרת אצלנו בכלל — Firebase של גוגל שומר אותה מוצפנת.'),
        h('li', {}, 'כללי אבטחה בשרת מוודאים שרק אתה יכול לקרוא ולשנות את הכרטיסים והפרטים שלך.'),
        h('li', {}, 'אי אפשר לשנות מחיר או לקנות יותר כרטיסים ממה שנשאר — השרת בודק כל רכישה.'),
        h('li', {}, 'מחיקת חשבון ושינויים רגישים דורשים אישור זהות מחדש.')
      )
    )
  ));
}
