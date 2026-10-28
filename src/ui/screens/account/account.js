// החשבון שלי: מי מחובר, ומעבר לפרטים, מכשירים, אבטחה, ניהול, יציאה ומחיקה.
import { h, mount, icon } from '../../../core/dom.js';
import { getState, subscribe, displayName } from '../../../core/store.js';
import { navigate } from '../../../core/router.js';
import { toast } from '../../../core/toast.js';
import { confirmDialog } from '../../../core/dialog.js';
import { copyText } from '../../../core/clipboard.js';
import { watchDevices } from '@services/devices-service.js';
import { signOutHere } from '../../../app/session.js';
import { APP_VERSION } from '../../../config/app-config.js';
import { avatar } from '../../components/avatar.js';
import { listRow, rowGroup } from '../../components/list-row.js';

export function render(root) {
  const { user } = getState();
  const devicesSub = h('span', {}, 'טוען…');
  const adminSlot = h('div');
  const nameEl = h('h2', { class: 'profile-card__name' }, displayName());

  const signOutRow = listRow({
    iconName: 'logout',
    title: 'התנתקות מהמכשיר הזה',
    onClick: async () => {
      const ok = await confirmDialog({ title: 'להתנתק?', message: 'הכרטיסים נשארים שמורים בחשבון. אפשר להתחבר שוב מתי שרוצים.', confirmText: 'התנתקות' });
      if (ok) await signOutHere();
    }
  });

  const uidRow = listRow({
    iconName: 'copy',
    title: 'מזהה משתמש (UID)',
    subtitle: user.uid,
    onClick: async () => toast(await copyText(user.uid) ? 'המזהה הועתק' : 'לא הצלחנו להעתיק', 'ok')
  });

  const drawAdmin = (state) => {
    adminSlot.replaceChildren(state.isAdmin
      ? rowGroup('מנהל', listRow({ iconName: 'star', title: 'ניהול הופעות', subtitle: 'טעינת הופעות, פתיחה וסגירה של מכירה', onClick: () => navigate('/admin') }))
      : '');
    nameEl.textContent = displayName();
  };

  mount(root, h('div', { class: 'page' },
    h('section', { class: 'profile-card' },
      avatar(displayName(), 'lg'),
      nameEl,
      h('p', { class: 'muted', dir: 'ltr' }, user.email),
      h('div', { class: 'profile-card__chips' },
        h('span', { class: 'chip chip--neutral' }, user.provider === 'google' ? 'מחובר עם Google' : 'מחובר עם מייל וסיסמה'),
        h('span', { class: `chip ${user.emailVerified ? 'chip--paid' : 'chip--low'}` }, user.emailVerified ? 'מייל מאומת' : 'מייל לא מאומת')
      )
    ),
    rowGroup('החשבון',
      listRow({ iconName: 'edit', title: 'פרטים אישיים', subtitle: 'שם, טלפון ועיר', onClick: () => navigate('/account/profile') }),
      listRow({ iconName: 'phone', title: 'המכשירים שלי', subtitle: devicesSub, onClick: () => navigate('/account/devices') }),
      listRow({ iconName: 'shield', title: 'אבטחה והתחברות', subtitle: 'סיסמה, אימות מייל, ניתוק מכשירים', onClick: () => navigate('/account/security') })
    ),
    adminSlot,
    rowGroup('', signOutRow,
      listRow({ iconName: 'trash', title: 'מחיקת החשבון', danger: true, onClick: () => navigate('/account/delete') })
    ),
    rowGroup('על האפליקציה',
      listRow({ iconName: 'info', title: 'כרטיס — אפליקציית אימון', subtitle: `גרסה ${APP_VERSION} · ההופעות והתשלומים מדומים` }),
      uidRow
    )
  ));

  drawAdmin(getState());
  const stopStore = subscribe(drawAdmin);
  const stopDevices = watchDevices(user.uid, (list) => {
    devicesSub.textContent = list.length === 1 ? 'מכשיר אחד מחובר' : `${list.length} מכשירים מחוברים`;
  }, () => { devicesSub.textContent = ''; });

  return () => { stopStore(); stopDevices(); };
}
