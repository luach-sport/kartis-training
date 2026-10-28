// הגדרות כלליות של האפליקציה במקום אחד.
const env = import.meta.env || {};

export const APP_NAME = 'כרטיס';
export const APP_TAGLINE = 'אפליקציית אימון — ההופעות והתשלומים מדומים';
export const APP_VERSION = env.VITE_APP_VERSION || '1.0-dev';

// כמה כרטיסים מותר להזמין בבת אחת (אותו מספר מופיע גם בכללי האבטחה).
export const MAX_TICKETS_PER_ORDER = 6;

// כמה זמן לחכות לפני שאפשר לבקש שוב מייל אימות.
export const RESEND_COOLDOWN_SECONDS = 60;

// מצב דמו: שירותים מדומים בזיכרון במקום Firebase (לבדיקות בדפדפן בלבד).
export const IS_MOCK = env.MODE === 'mock';
