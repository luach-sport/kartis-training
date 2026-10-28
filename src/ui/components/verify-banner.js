// תזכורת למי שנרשם עם מייל ועוד לא אימת אותו: בלי אימות אי אפשר לקנות.
import { h, icon } from '../../core/dom.js';
import { navigate } from '../../core/router.js';

export function verifyBanner(user) {
  if (!user || user.emailVerified) return null;
  return h('button', { class: 'notice notice--warn', onclick: () => navigate('/verify') },
    icon('mail', 20),
    h('span', { class: 'notice__text' },
      h('strong', {}, 'כדי לקנות כרטיסים צריך לאמת את המייל.'),
      h('span', {}, ' לחץ כאן לפרטים')
    )
  );
}
