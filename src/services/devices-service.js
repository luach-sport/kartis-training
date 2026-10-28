// המכשירים שמחוברים לחשבון: users/{uid}/devices/{deviceId}
// כל מכשיר רושם את עצמו בכניסה, ומאזין למסמך של עצמו: אם מחקו אותו ממכשיר אחר — הוא מתנתק.
import {
  doc, collection, getDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/db.js';
import { getDeviceId } from '../core/device-id.js';
import { deviceInfo } from '../core/platform.js';
import { APP_VERSION } from '../config/app-config.js';

const deviceRef = (uid, id) => doc(db, 'users', uid, 'devices', id);

export const thisDeviceId = () => getDeviceId();

export async function registerThisDevice(uid) {
  const id = getDeviceId();
  const info = await deviceInfo();
  const ref = deviceRef(uid, id);
  const fields = {
    name: info.name || 'מכשיר',
    platform: info.platform || 'web',
    model: info.model || '',
    appVersion: String(APP_VERSION).slice(0, 20),
    lastSeen: serverTimestamp()
  };
  let snap = null;
  try {
    snap = await getDoc(ref);
  } catch {
    return id; // בלי חיבור ובלי עותק שמור — ננסה בפתיחה הבאה
  }
  if (snap.exists()) await updateDoc(ref, fields);
  else await setDoc(ref, { ...fields, createdAt: serverTimestamp() });
  return id;
}

export function watchDevices(uid, callback, onError) {
  const q = query(collection(db, 'users', uid, 'devices'), orderBy('lastSeen', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })));
  }, onError);
}

// מחזיר true/false: האם המכשיר הזה עדיין רשום בחשבון.
export function watchThisDevice(uid, callback) {
  return onSnapshot(deviceRef(uid, getDeviceId()), (snap) => {
    callback(snap.exists(), snap.metadata.fromCache);
  }, () => {});
}

export async function removeDevice(uid, deviceId) {
  await deleteDoc(deviceRef(uid, deviceId));
}
