// עריכת פרטים אישיים. נשמר בענן ומתעדכן בכל המכשירים.
import { h, mount } from '../../../core/dom.js';
import { getState, displayName } from '../../../core/store.js';
import { goBack } from '../../../core/router.js';
import { toast } from '../../../core/toast.js';
import { saveProfile } from '@services/profile-service.js';
import { describeError } from '../../../core/errors.js';
import { checkName, checkPhone, checkCity, normalizePhone } from '../../../core/validate.js';
import { withBusy } from '../../../core/busy.js';
import { field } from '../../components/field.js';
import { formMessage } from '../../components/form-error.js';

export function render(root) {
  const { user, profile } = getState();
  const msg = formMessage();
  const name = field({ label: 'שם מלא', name: 'name', autocomplete: 'name', value: displayName(), maxlength: 60 });
  const phone = field({ label: 'טלפון (לא חובה)', name: 'phone', type: 'tel', autocomplete: 'tel', inputmode: 'tel', dir: 'ltr', value: profile?.phone || '', placeholder: '0521234567' });
  const city = field({ label: 'עיר (לא חובה)', name: 'city', autocomplete: 'address-level2', value: profile?.city || '', maxlength: 40 });
  const save = h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'שמירה');

  const onSubmit = async (e) => {
    e.preventDefault();
    msg.clear();
    const errors = [[name, checkName(name.value)], [phone, checkPhone(phone.value)], [city, checkCity(city.value)]];
    errors.forEach(([f, err]) => f.setError(err));
    if (errors.some(([, err]) => err)) return;
    await withBusy(save, async () => {
      try {
        const result = await saveProfile(user.uid, {
          displayName: name.value.trim(),
          phone: normalizePhone(phone.value),
          city: city.value.trim()
        });
        toast(result === 'queued' ? 'נשמר במכשיר — יעלה לענן כשיחזור החיבור' : 'הפרטים נשמרו', 'ok');
        goBack('/account');
      } catch (err) {
        msg.error(describeError(err));
      }
    }, 'שומר…');
  };

  mount(root, h('div', { class: 'page' },
    h('form', { class: 'form card', novalidate: true, onsubmit: onSubmit },
      name.el,
      h('div', { class: 'field' },
        h('span', { class: 'field__label' }, 'מייל'),
        h('p', { class: 'input input--readonly', dir: 'ltr' }, user.email),
        h('p', { class: 'field__msg' }, 'המייל הוא שם המשתמש שלך ואי אפשר לשנות אותו כאן.')
      ),
      phone.el,
      city.el,
      msg.el,
      save
    )
  ));
}
