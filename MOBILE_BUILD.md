# 📱 Guide de Build des Applications Mobiles

Ce guide explique comment générer les applications Android (APK/AAB) et iOS (IPA) pour **PharmFinder**.

## 🎯 Prérequis

### Pour Android
- **Android Studio** installé ([Télécharger](https://developer.android.com/studio))
- **Java JDK 17** ou supérieur
- **Gradle** (inclus avec Android Studio)

### Pour iOS
- **macOS** requis
- **Xcode** installé ([App Store](https://apps.apple.com/fr/app/xcode/id497799835))
- **CocoaPods** : `sudo gem install cocoapods`
- **Compte développeur Apple** pour publier sur l'App Store

---

## 🚀 Workflow de développement

### 1️⃣ Développement Web (comme d'habitude)
```bash
npm run dev
```
Développez votre application normalement sur http://localhost:5173

### 2️⃣ Build pour mobile
```bash
npm run build
```
Génère le dossier `dist/` avec votre application compilée

### 3️⃣ Synchroniser avec les plateformes natives
```bash
npm run cap:sync
```
Copie le code web vers les projets Android et iOS

---

## 📱 Android - Générer un APK/AAB

### Méthode 1 : Via Android Studio (Recommandé)

1. **Ouvrir le projet Android**
   ```bash
   npm run cap:open:android
   ```
   ou
   ```bash
   npx cap open android
   ```

2. **Dans Android Studio**
   - Attendez que Gradle finisse de synchroniser
   - Menu : `Build` → `Generate Signed Bundle / APK`
   - Choisir `APK` (pour test) ou `Android App Bundle` (pour Play Store)

3. **Créer une clé de signature** (première fois uniquement)
   - Cliquer sur `Create new...`
   - Remplir les informations :
     - **Key store path** : `C:\Users\...\pharmfinder-keystore.jks`
     - **Password** : Choisir un mot de passe fort
     - **Alias** : `pharmfinder`
     - **Validity** : 25 ans
     - Remplir les informations (Nom, Organisation, etc.)
   - ⚠️ **IMPORTANT** : Sauvegarder ce fichier et le mot de passe en lieu sûr !

4. **Signer l'application**
   - Sélectionner la clé créée
   - Build variant : `release`
   - Signature versions : V1 et V2 cochés
   - Cliquer sur `Finish`

5. **Récupérer le fichier**
   - APK : `android/app/release/app-release.apk`
   - AAB : `android/app/release/app-release.aab`

### Méthode 2 : En ligne de commande

```bash
cd android
./gradlew assembleRelease    # Pour APK
./gradlew bundleRelease       # Pour AAB (Play Store)
```

Fichiers générés :
- APK : `android/app/build/outputs/apk/release/app-release.apk`
- AAB : `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🍎 iOS - Générer un IPA

### Prérequis macOS uniquement

1. **Ouvrir le projet iOS**
   ```bash
   npm run cap:open:ios
   ```

2. **Dans Xcode**
   - Sélectionner votre équipe de développement (Team)
   - Sélectionner un device iOS réel ou simulateur
   - Menu : `Product` → `Archive`

3. **Distribuer l'application**
   - Une fois l'archive créée, cliquer sur `Distribute App`
   - Choisir la méthode :
     - **App Store Connect** : Pour publier sur l'App Store
     - **Ad Hoc** : Pour distribuer à des testeurs (TestFlight)
     - **Development** : Pour installer sur votre appareil
     - **Enterprise** : Si vous avez un compte entreprise

4. **Récupérer le IPA**
   - Xcode génère automatiquement le fichier `.ipa`

---

## 🔄 Scripts utiles

```bash
# Synchroniser après un build
npm run cap:sync

# Ouvrir Android Studio
npm run cap:open:android

# Ouvrir Xcode (macOS)
npm run cap:open:ios

# Build complet Android (build + sync + ouvre Android Studio)
npm run mobile:build:android

# Build complet iOS (build + sync + ouvre Xcode)
npm run mobile:build:ios

# Tester sur un appareil Android connecté
npm run cap:run:android

# Tester sur un simulateur iOS (macOS)
npm run cap:run:ios
```

---

## 🎨 Personnalisation

### Icône de l'application

1. Créer une icône **1024x1024 px** en PNG
2. Utiliser un générateur d'icônes :
   - [App Icon Generator](https://www.appicon.co/)
   - [Capacitor Assets](https://github.com/ionic-team/capacitor-assets)

3. Remplacer les icônes :
   - **Android** : `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - **iOS** : `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Splash Screen

1. Créer une image **2732x2732 px** en PNG
2. Utiliser [Capacitor Assets](https://github.com/ionic-team/capacitor-assets)
   ```bash
   npm install -g @capacitor/assets
   capacitor-assets generate --iconPath icon.png --splashPath splash.png
   ```

---

## 🚀 Publication

### Google Play Store (Android)

1. Créer un compte développeur Google Play (25$ unique)
2. Créer une nouvelle application dans Play Console
3. Télécharger le fichier **AAB** (Android App Bundle)
4. Remplir les informations :
   - Titre, description, captures d'écran
   - Catégorie : Médical
   - Classification du contenu
   - Politique de confidentialité
5. Soumettre pour révision

### Apple App Store (iOS)

1. Compte développeur Apple (99$/an)
2. Créer l'app dans App Store Connect
3. Télécharger le IPA via Xcode ou Transporter
4. Remplir les métadonnées
5. Soumettre pour révision

---

## 🔧 Configuration avancée

### Permissions Android

Modifier `android/app/src/main/AndroidManifest.xml` :
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
```

### Permissions iOS

Modifier `ios/App/App/Info.plist` :
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>PharmFinder a besoin de votre position pour trouver les pharmacies à proximité.</string>
<key>NSCameraUsageDescription</key>
<string>PharmFinder a besoin de la caméra pour scanner les ordonnances.</string>
```

---

## ❓ Problèmes fréquents

### Android : Gradle build failed
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### iOS : Pod install failed
```bash
cd ios/App
pod install --repo-update
```

### Capacitor : Assets not found
```bash
npm run build
npm run cap:sync
```

---

## 📚 Documentation officielle

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio](https://developer.android.com/studio/publish)
- [Xcode](https://developer.apple.com/documentation/xcode)
- [Play Store Publishing](https://developer.android.com/distribute/console)
- [App Store Publishing](https://developer.apple.com/app-store/submissions/)

---

## ✨ Astuce : Test rapide

Pour tester rapidement sur un appareil Android sans générer d'APK :

1. Activer le mode développeur sur votre téléphone Android
2. Activer le débogage USB
3. Connecter le téléphone à votre PC
4. Exécuter :
   ```bash
   npm run cap:run:android
   ```

L'app s'installe et démarre automatiquement ! 🎉
