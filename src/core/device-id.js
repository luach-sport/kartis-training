// מזהה קבוע למכשיר הזה, נשמר בזיכרון המקומי. כך החשבון יודע אילו מכשירים מחוברים אליו.
const KEY = 'kartis.deviceId';

function randomId() {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

let memoryId = null;

export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    memoryId ||= randomId();
    return memoryId;
  }
}
