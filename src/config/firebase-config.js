// פרטי החיבור לפרויקט ה-Firebase של האפליקציה (Project settings ← Your apps ← Web app).
// אלה לא סודות: מי שפותח את האפליקציה יכול לראות אותם בכל מקרה.
// מה ששומר על הנתונים הוא כללי האבטחה (firestore.rules), לא הסתרת המפתח הזה.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
