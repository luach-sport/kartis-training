# כרטיס (אימון) – הוראות לעבודה על הפרויקט

- **אפליקציית אימון בלבד.** לא מוסיפים אותה לאתר של Itzko (`luach-sport/itzko`) ולא לרשימות "עוד אפליקציות", ולא משתפים קוד עם שאר האפליקציות.
- Web app (Vite, ES modules) שנארז ל-APK עם Capacitor 7. כל push ל-main: בדיקות (כולל אמולטור Firebase) ← APK חתום ← Release.
- Firebase: Authentication (Google + מייל/סיסמה) ו-Cloud Firestore בלבד, בתוכנית Spark החינמית. בלי Cloud Functions ובלי Storage.
- מסכים לא קוראים ל-Firebase ישירות — רק דרך `src/services/`. לכל שירות יש תאום מדומה ב-`tests/mock-services/` (אותם שמות פונקציות). שינוי בחתימה של שירות = לעדכן גם את המדומה.
- כל שינוי במבנה הנתונים: לעדכן יחד את `firestore.rules`, השירות, הבדיקות ב-`tests/rules/`, ולפרסם את הכללים בקונסולה (Firestore ← Rules).
- מפתח החתימה `signing/training.jks` (סיסמה `kartis-training`, alias `kartis`) — גלוי בכוונה. ה-SHA-1 שלו רשום ב-Firebase; החלפת מפתח שוברת את Google Sign-In עד שרושמים את החדש.
- בדיקת מסכים מקומית: `npm run build:mock` ופתיחת `dist-mock/` בדפדפן.
