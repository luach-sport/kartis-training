// כפתור "חזרה" של אנדרואיד: חוזר מסך אחורה, ובמסכים הראשיים סוגר את האפליקציה.
import { App } from '@capacitor/app';
import { isNative } from './platform.js';
import { getCurrent, goBack } from './router.js';

const ROOT_PATHS = new Set(['/shows', '/tickets', '/account', '/login']);

export function setupBackButton() {
  if (!isNative()) return;
  App.addListener('backButton', () => {
    const overlay = document.querySelector('.dialog-overlay');
    if (overlay) {
      overlay.click();
      return;
    }
    const cur = getCurrent();
    if (!cur || ROOT_PATHS.has(cur.path) || cur.path === '/') App.exitApp();
    else goBack(cur.route.backTo || '/shows');
  });
}
