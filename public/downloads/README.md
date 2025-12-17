# 📱 Dossier des Téléchargements APK

## Comment placer l'APK ici

### 1️⃣ Après avoir généré l'APK Android

Une fois le build terminé, vous trouverez l'APK ici :
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 2️⃣ Copier l'APK dans ce dossier

Pour un APK de **debug** (test) :
```bash
cp android/app/build/outputs/apk/debug/app-debug.apk public/downloads/pharmfinder-debug.apk
```

Pour un APK de **release** (production) :
```bash
cp android/app/build/outputs/apk/release/app-release.apk public/downloads/pharmfinder-release.apk
```

### 3️⃣ Rebuild le site

```bash
npm run build
```

L'APK sera alors accessible à l'URL :
- **Production** : `https://votre-site.com/downloads/pharmfinder-release.apk`
- **Debug** : `https://votre-site.com/downloads/pharmfinder-debug.apk`

---

## 📝 Notes

- Le fichier APK doit être nommé **exactement** `pharmfinder-release.apk` pour correspondre au lien sur la landing page
- Taille approximative d'un APK : 20-40 MB
- Pour publier sur Google Play, utilisez un **AAB** (Android App Bundle) au lieu d'un APK

---

## 🚀 Mise à jour rapide

Script pour automatiser la copie :
```bash
# Depuis la racine du projet front-1
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk ../public/downloads/pharmfinder-release.apk
npm run build
```
