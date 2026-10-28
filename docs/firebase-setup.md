# הקמת Firebase לאפליקציה — צעד אחר צעד

אותם צעדים בדיוק תעשה כשתבנה אפליקציה כזו למישהו אחר (רק בחשבון הגוגל שלו או בפרויקט שהוא ישתף איתך).

1. **אימות דו-שלבי** בחשבון הגוגל — Firebase דורש אותו כדי להיכנס לקונסולה.
2. **יצירת פרויקט** ב-<https://console.firebase.google.com> (בלי Google Analytics — לא צריך).
3. **Authentication ← Sign-in method**: להפעיל *Email/Password* ו-*Google* (בגוגל בוחרים מייל תמיכה).
4. **Firestore Database ← Create database**: מיקום קרוב (למשל `eur3` או `me-west1`), מצב *Production*.
5. **Firestore ← Rules**: מדביקים את התוכן של `firestore.rules` ולוחצים *Publish*.
6. **Project settings ← Your apps ← Android**:
   - Package name: `com.luachsport.kartis`
   - SHA-1 ו-SHA-256 של מפתח החתימה (מקבלים עם `keytool -list -v -keystore signing/training.jks`)
   - מורידים את `google-services.json` ושמים ב-`android-config/`
7. **Project settings ← Your apps ← Web app**: מעתיקים את `firebaseConfig` אל `src/config/firebase-config.js`.
8. **מנהל**: אחרי ההתחברות הראשונה, ב-Firestore יוצרים אוסף `admins` ובו מסמך שהמזהה שלו הוא ה-UID שלך
   (מופיע במסך "החשבון שלי" ← "מזהה משתמש"). מעכשיו מופיע לך "ניהול הופעות", ושם טוענים הופעות לדוגמה.

## למה כל דבר

- **SHA-1** — גוגל מוודאת שבקשת ההתחברות מגיעה מהאפליקציה שלך ולא מאפליקציה מתחזה. מפתח חתימה אחר = Google Sign-In לא עובד.
- **מפתח ה-API ב-`firebase-config.js` אינו סוד** — הוא מזהה את הפרויקט. מה שמגן על הנתונים הם כללי האבטחה.
- **מצב Production** — בהתחלה הכול חסום, ופותחים רק מה שצריך דרך הכללים. "Test mode" פותח הכול לכולם לחודש — מסוכן.
- **עלות**: תוכנית Spark החינמית, בלי כרטיס אשראי. האפליקציה משתמשת רק ב-Authentication וב-Firestore.
