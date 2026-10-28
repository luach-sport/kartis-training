import { db, delay, notify, watch } from './mock-db.js';
import { getDeviceId } from '../../src/core/device-id.js';
import { APP_VERSION } from '../../src/config/app-config.js';

export const thisDeviceId = () => getDeviceId();

export async function registerThisDevice(uid) {
  await delay();
  const list = (db.devices[uid] ||= {});
  const id = getDeviceId();
  list[id] = { ...(list[id] || { createdAt: new Date() }), name: 'הדפדפן הזה', platform: 'web', model: '', appVersion: APP_VERSION, lastSeen: new Date() };
  if (!list['demo-phone']) {
    list['demo-phone'] = { name: 'Samsung Galaxy A54', platform: 'android', model: 'Samsung Galaxy A54', appVersion: '1.0.3',
      lastSeen: new Date(Date.now() - 3 * 3600e3), createdAt: new Date(Date.now() - 12 * 864e5) };
  }
  notify();
  return id;
}

export function watchDevices(uid, callback) {
  return watch(() => callback(Object.entries(db.devices[uid] || {}).map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.lastSeen - a.lastSeen)));
}

export function watchThisDevice(uid, callback) {
  return watch(() => callback(Boolean(db.devices[uid]?.[getDeviceId()]), false));
}

export async function removeDevice(uid, deviceId) {
  await delay();
  delete db.devices[uid]?.[deviceId];
  notify();
}
