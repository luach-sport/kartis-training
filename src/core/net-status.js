// מעקב אחרי חיבור לאינטרנט, כדי להציג "בלי חיבור — מוצגים נתונים שמורים".
import { setState } from './store.js';

export function watchNetwork() {
  const update = () => setState({ online: navigator.onLine !== false });
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

export function isOnline() {
  return navigator.onLine !== false;
}
