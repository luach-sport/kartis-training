// ברקוד QR לכרטיס, נוצר במכשיר עצמו (עובד גם בלי אינטרנט).
import QRCode from 'qrcode';
import { h } from '../../core/dom.js';

export function qrCode(text, size = 220) {
  const img = h('img', { class: 'qr', width: size, height: size, alt: 'ברקוד הכרטיס' });
  QRCode.toDataURL(text, { width: size * 2, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0F1024', light: '#FFFFFF' } })
    .then((url) => { img.src = url; })
    .catch(() => { img.alt = 'לא הצלחנו ליצור ברקוד'; });
  return img;
}
