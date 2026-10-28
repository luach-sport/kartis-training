// בדיקות קלט לפני ששולחים לשרת. השרת בודק שוב בכללי האבטחה — כאן זה רק לנוחות המשתמש.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^0[0-9]{8,9}$/;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizePhone(value) {
  return String(value || '').replace(/[\s-]/g, '');
}

export function checkEmail(value) {
  const v = normalizeEmail(value);
  if (!v) return 'צריך למלא כתובת מייל.';
  if (!EMAIL_RE.test(v)) return 'כתובת המייל לא תקינה.';
  return '';
}

export function checkName(value) {
  const v = String(value || '').trim();
  if (!v) return 'צריך למלא שם.';
  if (v.length < 2) return 'השם קצר מדי.';
  if (v.length > 60) return 'השם ארוך מדי (עד 60 תווים).';
  return '';
}

export function checkPhone(value) {
  const v = normalizePhone(value);
  if (!v) return '';
  if (!PHONE_RE.test(v)) return 'מספר טלפון לא תקין (לדוגמה 0521234567).';
  return '';
}

export function checkCity(value) {
  return String(value || '').trim().length > 40 ? 'שם העיר ארוך מדי.' : '';
}

// ציון חוזק סיסמה: 0 (חלשה מאוד) עד 4 (חזקה).
export function passwordScore(value) {
  const v = String(value || '');
  if (!v) return 0;
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[a-zA-Zא-ת]/.test(v) && /[0-9]/.test(v)) score++;
  if (/[^a-zA-Z0-9א-ת]/.test(v) || (/[a-z]/.test(v) && /[A-Z]/.test(v))) score++;
  return Math.min(score, 4);
}

export const PASSWORD_LABELS = ['חלשה מאוד', 'חלשה', 'בינונית', 'טובה', 'חזקה'];

export function checkPassword(value) {
  const v = String(value || '');
  if (!v) return 'צריך למלא סיסמה.';
  if (v.length < 8) return 'הסיסמה צריכה להיות לפחות 8 תווים.';
  if (!/[0-9]/.test(v) || !/[a-zA-Zא-ת]/.test(v)) return 'הסיסמה צריכה לכלול גם אותיות וגם מספרים.';
  return '';
}

export function checkPasswordMatch(a, b) {
  return a === b ? '' : 'הסיסמאות לא זהות.';
}
