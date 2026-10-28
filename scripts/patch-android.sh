#!/usr/bin/env bash
# מתאים את פרויקט האנדרואיד שנוצר ב-`npx cap add android` לאפליקציה "כרטיס (אימון)".
set -euo pipefail

RUN="${GITHUB_RUN_NUMBER:-1}"
VERSION="${APP_VERSION:-1.0}"
APP=android/app
RES=$APP/src/main/res

# 1) קובץ החיבור ל-Firebase (מהקונסולה: Project settings ← Android app ← google-services.json)
if [ ! -s android-config/google-services.json ]; then
  echo "::error::android-config/google-services.json is missing — download it from the Firebase console"
  exit 1
fi
cp android-config/google-services.json "$APP/google-services.json"

# 2) התחברות עם Google בתוך הטלפון (Credential Manager) — דרך התוסף של Capawesome
if ! grep -q rgcfaIncludeGoogle android/variables.gradle; then
  perl -0pi -e 's|ext \{|ext {\n    rgcfaIncludeGoogle = true|' android/variables.gradle
fi

# 3) אייקונים
find "$RES" -name 'splash.png' -delete
cp -R android-res/. "$RES/"

# 4) מסך פתיחה כתום עם הכרטיס (אנדרואיד 12 ומעלה)
STY=$RES/values/styles.xml
perl -0pi -e 's|(<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">)|$1\n        <item name="windowSplashScreenBackground">#0F1024</item>\n        <item name="windowSplashScreenAnimatedIcon">\@mipmap/ic_launcher_foreground</item>|' "$STY"

# 5) Target SDK 34: שורת המצב הקלאסית (האפליקציה מותקנת ישירות, לא מגוגל פליי)
sed -i -E 's/targetSdkVersion = [0-9]+/targetSdkVersion = 34/' android/variables.gradle

# 6) גרסה: השם הוא מספר הגרסה, הקוד הוא מספר הבנייה (כדי שכל APK יותקן כעדכון)
sed -i -E "s/versionCode [0-9]+/versionCode ${RUN}/; s/versionName \"[^\"]*\"/versionName \"${VERSION}\"/" "$APP/build.gradle"

# 7) חתימה במפתח האימון הקבוע. טביעת האצבע שלו (SHA-1) רשומה ב-Firebase — בלעדיה Google Sign-In לא עובד.
cp signing/training.jks "$APP/training.jks"
cat >> "$APP/build.gradle" <<'GRADLE'

android {
    signingConfigs {
        training {
            storeFile file("training.jks")
            storePassword System.getenv("KARTIS_STORE_PASSWORD")
            keyAlias System.getenv("KARTIS_KEY_ALIAS")
            keyPassword System.getenv("KARTIS_KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.training
            minifyEnabled false
        }
    }
}
GRADLE

echo "--- google services plugin"; grep -n "google-services" android/build.gradle "$APP/build.gradle" || true
echo "--- variables"; cat android/variables.gradle
echo "--- launch style"; grep -n -A3 'NoActionBarLaunch' "$STY"
echo "--- versions"; grep -n -E 'versionCode|versionName' "$APP/build.gradle"
