# PharmFinder 💊

Application mobile et web pour trouver des médicaments dans les pharmacies à proximité.

## 🚀 Fonctionnalités

- 🔍 **Recherche de médicaments** - Trouvez rapidement les pharmacies qui ont vos médicaments en stock
- 📍 **Géolocalisation** - Pharmacies triées par distance depuis votre position
- 📱 **Application mobile native** - Interface optimisée pour iOS et Android via Capacitor
- 🌐 **Version web** - Accessible depuis n'importe quel navigateur
- 📸 **Scan d'ordonnance** - OCR pour extraire automatiquement les médicaments
- 🛒 **Recherche multiple** - Recherchez plusieurs médicaments simultanément
- 💳 **Filtres avancés** - Par distance, prix, assurance, note

## 📦 Technologies utilisées

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling moderne
- **shadcn/ui** - Composants UI élégants
- **TanStack Query** - Gestion du state et du cache
- **React Router** - Navigation
- **Capacitor 8** - Wrapper mobile natif

### Backend
- **Django 5.2** + **Django REST Framework**
- **PostgreSQL** (production) / **SQLite** (dev)
- **OpenAI Vision API** - OCR pour les ordonnances
- **OpenRouteService** - Calcul d'itinéraires

## 🛠️ Installation

### Prérequis
- Node.js 18+ et npm
- Python 3.11+
- Git

### Installation du Frontend

```bash
# Cloner le repository
git clone https://github.com/PrinceCharles-01/Umbrella-Front.git
cd Umbrella-Front/front-1

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le site sera accessible sur `http://localhost:8080`

### Installation du Backend

```bash
cd ../django-backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Migrations de la base de données
python manage.py migrate

# Démarrer le serveur
python manage.py runserver 3001
```

## 📱 Build Mobile

### Android

```bash
cd front-1

# Build de l'application et sync avec Capacitor
npm run mobile:build:android

# L'APK de debug sera généré dans:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS

```bash
npm run mobile:build:ios
```

## 🌍 Déploiement

### Frontend (Vercel)
Le frontend est automatiquement déployé sur Vercel à chaque push sur `main`.

**URL de production**: https://umbrellafront.vercel.app

### Backend (Railway)
Le backend Django est hébergé sur Railway.

**URL de production**: https://web-production-ef9dc.up.railway.app

## 📱 Télécharger l'application

### Android
[Télécharger l'APK](https://github.com/PrinceCharles-01/Umbrella-Front/releases/download/v1.0.0/pharmafinder-release.apk)

### iOS
Bientôt disponible sur l'App Store

## 🔧 Structure du projet

```
Umbrella-1/
├── front-1/                    # Application React
│   ├── src/
│   │   ├── pages/             # Pages principales
│   │   │   ├── Index.tsx      # Version web
│   │   │   └── IndexMobile.tsx # Version mobile
│   │   ├── components/        # Composants réutilisables
│   │   ├── lib/              # Utilitaires et API
│   │   │   ├── api.ts        # Appels API
│   │   │   └── http.ts       # Wrapper HTTP (Capacitor)
│   │   └── hooks/            # React hooks
│   ├── android/              # Code natif Android
│   └── ios/                  # Code natif iOS
│
└── django-backend/            # API Django REST
    ├── api/                  # Application principale
    ├── orders/               # Gestion des commandes
    └── umbrella_api/         # Configuration Django
```

## 🎯 Scripts disponibles

### Frontend

```bash
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Aperçu du build

# Scripts Capacitor
npm run cap:sync         # Synchroniser le code web avec mobile
npm run cap:open:android # Ouvrir dans Android Studio
npm run cap:open:ios     # Ouvrir dans Xcode
npm run mobile:build     # Build + sync
```

### Backend

```bash
python manage.py runserver     # Serveur de développement
python manage.py migrate       # Appliquer les migrations
python manage.py createsuperuser # Créer un admin
python manage.py test         # Tests unitaires
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé par Prince Charles

- GitHub: [@PrinceCharles-01](https://github.com/PrinceCharles-01)
- Frontend: [Umbrella-Front](https://github.com/PrinceCharles-01/Umbrella-Front)

## 🙏 Remerciements

- OpenAI pour l'API Vision (OCR)
- OpenRouteService pour le calcul d'itinéraires
- La communauté open-source pour tous les packages utilisés
