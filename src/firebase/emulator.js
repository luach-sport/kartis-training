// בבדיקות האוטומטיות (GitHub Actions) האפליקציה מתחברת לאמולטור מקומי של Firebase
// במקום לשרת האמיתי. הבדיקות מדליקות את הדגל הזה לפני שהן טוענות את השירותים.
export const useEmulators = Boolean(globalThis.__KARTIS_EMULATORS__);

export const EMULATOR = {
  authUrl: 'http://127.0.0.1:9099',
  firestoreHost: '127.0.0.1',
  firestorePort: 8080,
  projectId: 'demo-kartis'
};
