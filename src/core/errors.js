// תרגום שגיאות (של Firebase ושל האפליקציה) להודעות ברורות בעברית.

export class AppError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
    this.name = 'AppError';
  }
}

export const appError = (code) => new AppError(code, MESSAGES[code] || code);

const MESSAGES = {
  // התחברות
  'auth/invalid-email': 'כתובת המייל לא תקינה.',
  'auth/missing-email': 'צריך למלא כתובת מייל.',
  'auth/missing-password': 'צריך למלא סיסמה.',
  'auth/weak-password': 'הסיסמה חלשה מדי. בחר לפחות 8 תווים, עם אותיות ומספרים.',
  'auth/email-already-in-use': 'כבר יש חשבון עם המייל הזה. אפשר להתחבר, או לאפס את הסיסמה.',
  'auth/invalid-credential': 'המייל או הסיסמה לא נכונים.',
  'auth/invalid-login-credentials': 'המייל או הסיסמה לא נכונים.',
  'auth/wrong-password': 'המייל או הסיסמה לא נכונים.',
  'auth/user-not-found': 'המייל או הסיסמה לא נכונים.',
  'auth/user-mismatch': 'התחברת עם חשבון אחר מהחשבון הנוכחי.',
  'auth/too-many-requests': 'היו יותר מדי ניסיונות. חכה כמה דקות ונסה שוב.',
  'auth/network-request-failed': 'אין חיבור לאינטרנט. בדוק את החיבור ונסה שוב.',
  'auth/user-disabled': 'החשבון הזה הושבת.',
  'auth/requires-recent-login': 'מטעמי אבטחה צריך לאשר שוב את הזהות לפני הפעולה הזו.',
  'auth/popup-closed-by-user': 'ההתחברות בוטלה.',
  'auth/cancelled-popup-request': 'ההתחברות בוטלה.',
  'auth/popup-blocked': 'הדפדפן חסם את חלון ההתחברות.',
  'auth/account-exists-with-different-credential': 'המייל הזה כבר רשום עם דרך התחברות אחרת.',
  'auth/operation-not-allowed': 'שיטת ההתחברות הזו עדיין לא הופעלה בפרויקט.',
  'auth/expired-action-code': 'הקישור פג תוקף. בקש קישור חדש.',
  'auth/invalid-action-code': 'הקישור לא תקין או שכבר השתמשו בו.',

  // מסד נתונים
  'permission-denied': 'אין הרשאה לפעולה הזו.',
  'unavailable': 'אין חיבור לשרת. בדוק את האינטרנט ונסה שוב.',
  'failed-precondition': 'הנתונים השתנו בזמן הפעולה. נסה שוב.',
  'aborted': 'הנתונים השתנו בזמן הפעולה. נסה שוב.',
  'deadline-exceeded': 'השרת לא ענה בזמן. נסה שוב.',

  // האפליקציה
  'app/cancelled': 'הפעולה בוטלה.',
  'app/offline': 'הפעולה הזו צריכה חיבור לאינטרנט.',
  'app/sold-out': 'אין מספיק כרטיסים פנויים באזור הזה.',
  'app/show-ended': 'ההופעה כבר התקיימה.',
  'app/show-inactive': 'המכירה להופעה הזו סגורה.',
  'app/show-missing': 'ההופעה לא נמצאה.',
  'app/not-verified': 'צריך לאמת את כתובת המייל לפני רכישה.',
  'app/qty-invalid': 'כמות הכרטיסים לא תקינה.',
  'app/order-missing': 'ההזמנה לא נמצאה.',
  'app/not-cancellable': 'אי אפשר לבטל את ההזמנה הזו.',
  'app/google-unavailable': 'התחברות עם גוגל לא זמינה כרגע.'
};

// ביטולים של חלון ההתחברות של גוגל מגיעים מהטלפון כטקסט ולא כקוד.
const CANCEL_PATTERN = /cancel|canceled|cancelled|dismiss|12501|no credentials available/i;

export function errorCode(err) {
  if (!err) return 'unknown';
  if (err.code) return String(err.code).replace(/^firestore\//, '');
  if (CANCEL_PATTERN.test(err.message || '')) return 'app/cancelled';
  return 'unknown';
}

export function isCancel(err) {
  const code = errorCode(err);
  return code === 'app/cancelled' || code === 'auth/popup-closed-by-user'
    || code === 'auth/cancelled-popup-request' || CANCEL_PATTERN.test(err?.message || '');
}

export function describeError(err) {
  const code = errorCode(err);
  if (MESSAGES[code]) return MESSAGES[code];
  if (err instanceof AppError && err.message) return err.message;
  return 'משהו השתבש. נסה שוב בעוד רגע.';
}
