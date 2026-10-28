// האם רצים בתוך אפליקציית אנדרואיד או בדפדפן, ופרטי המכשיר לרשימת "המכשירים שלי".
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const isNative = () => Capacitor.isNativePlatform();
export const platformName = () => Capacitor.getPlatform(); // android / ios / web

const PLATFORM_LABELS = { android: 'אנדרואיד', ios: 'אייפון', web: 'דפדפן' };

export function platformLabel(platform) {
  return PLATFORM_LABELS[platform] || platform || 'מכשיר';
}

let cachedInfo = null;

export async function deviceInfo() {
  if (cachedInfo) return cachedInfo;
  try {
    const info = await Device.getInfo();
    const maker = info.manufacturer && info.manufacturer !== 'Google Inc.' ? info.manufacturer : '';
    const model = [maker, info.model].filter(Boolean).join(' ').trim();
    cachedInfo = {
      platform: info.platform || platformName(),
      model: model.slice(0, 60),
      name: (model || platformLabel(info.platform)).slice(0, 60)
    };
  } catch {
    cachedInfo = { platform: platformName(), model: '', name: platformLabel(platformName()) };
  }
  return cachedInfo;
}
