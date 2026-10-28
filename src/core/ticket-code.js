// קוד כרטיס אקראי (מופיע בברקוד). בלי אותיות שקל להתבלבל ביניהן כמו O ו-0.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeTicketCode(length = 10) {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

// תצוגה נוחה לקריאה: ABCD-EFGH-JK
export function formatTicketCode(code) {
  return String(code || '').replace(/(.{4})(?=.)/g, '$1-');
}
