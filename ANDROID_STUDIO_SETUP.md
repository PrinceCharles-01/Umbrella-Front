# 🚀 Guide d'installation Android Studio - Génération APK

## ⚠️ Problème actuel

Le build Gradle a échoué avec l'erreur :
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
```

**Raison** : Android SDK n'est pas installé sur votre machine.

---

## 📥 Étape 1 : Installer Android Studio

### Téléchargement
1. Aller sur : https://developer.android.com/studio
2. Cliquer sur **Download Android Studio**
3. Accepter les conditions
4. Télécharger le fichier (environ 1 GB)

### Installation
1. Exécuter le fichier téléchargé
2. Suivre l'assistant d'installation
3. **IMPORTANT** : Cocher "Android SDK" et "Android Virtual Device"
4. Choisir le dossier d'installation (par défaut : `C:\Program Files\Android\Android Studio`)
5. Attendre la fin de l'installation (peut prendre 10-15 minutes)

---

## ⚙️ Étape 2 : Configuration initiale

### Premier lancement
1. Ouvrir Android Studio
2. **Setup Wizard** s'affiche :
   - Choisir "Standard" installation
   - Choisir le thème (Darcula recommandé)
   - Cliquer sur "Next" > "Finish"
3. Android Studio va télécharger les SDK nécessaires (environ 2-3 GB)
4. **Patience** : Cela peut prendre 15-30 minutes

### Vérifier l'installation du SDK
1. Dans Android Studio : `File` → `Settings` (ou `Ctrl+Alt+S`)
2. Aller dans : `Appearance & Behavior` → `System Settings` → `Android SDK`
3. Vérifier que le SDK path est défini (ex: `C:\Users\Charles\AppData\Local\Android\Sdk`)
4. Sous "SDK Platforms", cocher au minimum :
   - ✅ Android 14.0 ("UpsideDownCake")
   - ✅ Android 13.0 ("Tiramisu")
   - ✅ Android 12.0 (S)
5. Sous "SDK Tools", vérifier que ces outils sont cochés :
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM installer) si CPU Intel

---

## 🔨 Étape 3 : Générer l'APK

### Méthode 1 : Via Android Studio (Recommandé)

1. **Ouvrir le projet Android** :
   ```bash
   cd C:\Users\Charles\Desktop\Umbrella-1\front-1
   npx cap open android
   ```
   OU double-cliquer sur : `front-1\android\build.gradle`

2. **Attendre la synchronisation Gradle** (première fois = 5-10 min)

3. **Générer l'APK Debug** (pour tester) :
   - Menu : `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Attendre la notification "APK(s) generated successfully"
   - Cliquer sur "locate" pour ouvrir le dossier
   - Fichier : `android\app\build\outputs\apk\debug\app-debug.apk`

4. **Générer l'APK Release** (pour production) :
   - Menu : `Build` → `Generate Signed Bundle / APK`
   - Choisir "APK" → Next
   - Créer une clé :
     - Cliquer sur "Create new..."
     - Key store path : `C:\Users\Charles\pharmfinder-keystore.jks`
     - Password : Choisir un mot de passe fort (⚠️ À SAUVEGARDER !)
     - Alias : `pharmfinder`
     - Validity : 25 years
     - Remplir les infos (First Name, Organization, etc.)
     - Cliquer OK
   - Sélectionner "release" build variant
   - V1 et V2 signature cochés
   - Finish
   - Fichier : `android\app\release\app-release.apk`

### Méthode 2 : En ligne de commande (Rapide)

**Une fois Android Studio installé** :

```bash
# Debug APK
cd C:\Users\Charles\Desktop\Umbrella-1\front-1\android
.\gradlew assembleDebug

# Release APK (non signé)
.\gradlew assembleRelease

# Trouver l'APK généré
ls app\build\outputs\apk\debug\app-debug.apk
ls app\build\outputs\apk\release\app-release-unsigned.apk
```

---

## 📦 Étape 4 : Copier l'APK vers le site

```bash
# Copier l'APK debug pour test immédiat
cp android\app\build\outputs\apk\debug\app-debug.apk public\downloads\pharmfinder-release.apk

# OU copier l'APK release signé
cp android\app\release\app-release.apk public\downloads\pharmfinder-release.apk

# Rebuild le site pour inclure l'APK
npm run build
```

---

## ✅ Étape 5 : Tester l'APK

### Sur votre PC (Émulateur)
1. Dans Android Studio : `Tools` → `Device Manager`
2. Créer un appareil virtuel (ex: Pixel 6)
3. Installer l'APK sur l'émulateur :
   ```bash
   adb install public\downloads\pharmfinder-release.apk
   ```

### Sur votre téléphone Android
1. Activer le mode développeur :
   - `Paramètres` → `À propos du téléphone`
   - Appuyer 7 fois sur "Numéro de build"
2. Activer le débogage USB :
   - `Paramètres` → `Options de développement`
   - Activer "Débogage USB"
3. Connecter le téléphone via USB
4. Installer l'APK :
   ```bash
   adb install public\downloads\pharmfinder-release.apk
   ```

OU simplement transférer l'APK sur le téléphone et l'ouvrir.

---

## 🎯 Résumé : Actions à faire MAINTENANT

1. ✅ **Télécharger Android Studio** : https://developer.android.com/studio
2. ✅ **Installer Android Studio** (cocher Android SDK)
3. ✅ **Laisser télécharger les SDK** (2-3 GB, 15-30 min)
4. ✅ **Ouvrir le projet** : `npx cap open android`
5. ✅ **Générer l'APK** : `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
6. ✅ **Copier l'APK** : vers `public/downloads/pharmfinder-release.apk`
7. ✅ **Rebuild** : `npm run build`

---

## ⏱️ Temps estimé

- Téléchargement Android Studio : **10-20 min** (selon connexion)
- Installation Android Studio : **10-15 min**
- Téléchargement SDK : **20-40 min** (selon connexion)
- Premier build APK : **5-10 min**
- Builds suivants : **1-2 min**

**Total première fois : 45 minutes à 1h30**

---

## 🆘 Problèmes fréquents

### "SDK location not found"
→ Android Studio n'est pas installé ou SDK path non configuré

### "Gradle build failed"
→ Attendre que Gradle finisse de télécharger (regarder la progress bar en bas d'Android Studio)

### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
→ Désinstaller l'ancienne version de l'app sur le téléphone d'abord

### APK trop gros (> 100 MB)
→ Normal pour la première fois. Pour optimiser :
```bash
# Build avec ProGuard/R8 (minification)
.\gradlew assembleRelease --console=verbose
```

---

## 📚 Documentation officielle

- [Android Studio Install](https://developer.android.com/studio/install)
- [Sign your app](https://developer.android.com/studio/publish/app-signing)
- [Build your app from command line](https://developer.android.com/build/building-cmdline)

---

**Une fois Android Studio installé, vous pourrez générer des APK en 2 minutes chrono ! 🚀**
