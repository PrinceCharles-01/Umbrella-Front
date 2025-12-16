# 🎨 Design System V2 - Umbrella PharmFinder
## Style SaaS Sophistiqué & Moderne

**Objectif** : Design ultra-professionnel, clean, sophistiqué avec un côté artistique subtil

---

## 🎨 Palette de Couleurs

### Couleurs Principales

```css
/* === GRIS SOPHISTIQUÉS (Base) === */
--background: 0 0% 98%;          /* Blanc légèrement gris */
--foreground: 0 0% 12%;          /* Gris très foncé presque noir */

/* === COULEURS PRIMAIRES === */
--primary: 0 0% 15%;             /* Gris charbon (remplace bleu) */
--primary-foreground: 0 0% 98%;  /* Blanc cassé */

/* === VERT PHARMACEUTIQUE (Emerald moderne) === */
--secondary: 160 84% 39%;        /* #10B981 - Emerald 500 */
--secondary-light: 158 64% 52%; /* #34D399 - Emerald 400 (hover) */
--secondary-dark: 161 94% 30%;  /* #059669 - Emerald 600 (pressed) */

/* === ROSE SOPHISTIQUÉ (Pink élégant) === */
--accent: 330 81% 60%;           /* #EC4899 - Pink 500 */
--accent-light: 330 81% 70%;    /* Plus clair pour hover */
--accent-foreground: 0 0% 98%;

/* === GRIS NEUTRES (Textes & Backgrounds) === */
--muted: 0 0% 96%;               /* Gris très clair */
--muted-foreground: 0 0% 45%;    /* Gris moyen */
--border: 0 0% 90%;              /* Bordures subtiles */

/* === FONCTIONNELS === */
--success: 142 76% 36%;          /* Vert succès */
--warning: 38 92% 50%;           /* Orange warning */
--destructive: 0 72% 51%;        /* Rouge erreur */
```

### Gradient Signatures

```css
/* Hero gradient (subtil et sophistiqué) */
.hero-gradient {
  background: linear-gradient(
    135deg,
    hsl(0 0% 98%) 0%,
    hsl(160 10% 98%) 50%,
    hsl(330 10% 98%) 100%
  );
}

/* Card gradient (glassmorphism moderne) */
.card-gradient {
  background: linear-gradient(
    to bottom,
    hsl(0 0% 100% / 0.8),
    hsl(0 0% 98% / 0.6)
  );
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid hsl(0 0% 90%);
}

/* Accent gradient (CTA buttons) */
.accent-gradient {
  background: linear-gradient(
    135deg,
    hsl(160 84% 39%),
    hsl(158 64% 52%)
  );
}

/* Pink accent gradient */
.pink-gradient {
  background: linear-gradient(
    135deg,
    hsl(330 81% 60%),
    hsl(330 81% 70%)
  );
}
```

---

## ✍️ Typographie Premium

### Police Principale : **Inter** (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### Hiérarchie Typographique

```css
/* Hero Title */
font-family: 'Inter', sans-serif;
font-weight: 800; /* Extra Bold */
font-size: 72px;
line-height: 1.1;
letter-spacing: -0.02em; /* Tracking serré */

/* Section Titles */
font-weight: 700; /* Bold */
font-size: 48px;
line-height: 1.2;
letter-spacing: -0.01em;

/* Card Titles */
font-weight: 600; /* Semi-Bold */
font-size: 24px;
line-height: 1.3;

/* Body Text */
font-weight: 400; /* Regular */
font-size: 16px;
line-height: 1.6;

/* Small Text / Captions */
font-weight: 500; /* Medium */
font-size: 14px;
line-height: 1.5;
letter-spacing: 0.005em;
```

---

## 🎭 Composants Signatures

### 1. Hero Section Sophistiquée

```tsx
<div className="relative overflow-hidden">
  {/* Gradient background */}
  <div className="absolute inset-0 hero-gradient" />

  {/* Subtle grid pattern */}
  <div className="absolute inset-0 opacity-[0.02]"
       style={{backgroundImage: 'url(/grid.svg)'}} />

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
    <div className="max-w-4xl">
      <h1 className="text-7xl font-extrabold text-foreground leading-tight mb-6">
        Trouvez vos médicaments
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600">
          {" "}en temps réel
        </span>
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Localisez instantanément les pharmacies qui ont vos médicaments en stock.
        Simple, rapide, intelligent.
      </p>
      <div className="flex gap-4">
        <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
          Commencer
        </button>
        <button className="px-8 py-4 bg-white border border-gray-200 text-foreground font-semibold rounded-xl hover:bg-gray-50 transition-all">
          En savoir plus
        </button>
      </div>
    </div>
  </div>
</div>
```

### 2. Header Minimaliste

```tsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
        <Pill className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-foreground">
        PharmFinder
      </span>
    </div>

    {/* Navigation */}
    <nav className="hidden md:flex items-center gap-8">
      <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Médicaments
      </a>
      <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Pharmacies
      </a>
      <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Scanner
      </a>
    </nav>

    {/* CTA */}
    <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all">
      Connexion
    </button>
  </div>
</header>
```

### 3. Cards Sophistiquées

```tsx
<div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
  {/* Icon */}
  <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
    <Search className="w-7 h-7 text-emerald-600" />
  </div>

  {/* Content */}
  <h3 className="text-xl font-semibold text-foreground mb-3">
    Recherche Intelligente
  </h3>
  <p className="text-muted-foreground leading-relaxed">
    Trouvez n'importe quel médicament en quelques secondes grâce à notre moteur de recherche avancé.
  </p>

  {/* Hover effect border */}
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
</div>
```

### 4. Buttons Modernes

```tsx
/* Primary Button (Emerald) */
<button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
  Action Principale
</button>

/* Secondary Button (Outline) */
<button className="px-6 py-3 bg-white border-2 border-gray-200 text-foreground font-semibold rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all">
  Action Secondaire
</button>

/* Ghost Button */
<button className="px-6 py-3 text-muted-foreground font-medium rounded-xl hover:bg-gray-100 hover:text-foreground transition-all">
  Action Tertiaire
</button>

/* Pink Accent Button */
<button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
  Action Spéciale
</button>
```

---

## 🎬 Animations Subtiles

### Micro-interactions

```css
/* Lift on hover (cards) */
.lift-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.lift-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
}

/* Scale on hover (buttons) */
.scale-hover {
  transition: transform 0.2s ease;
}
.scale-hover:hover {
  transform: scale(1.02);
}
.scale-hover:active {
  transform: scale(0.98);
}

/* Fade in entrance */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Stagger children */
.stagger-container > * {
  animation: fadeInUp 0.5s ease-out backwards;
}
.stagger-container > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-container > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-container > *:nth-child(3) { animation-delay: 0.3s; }
```

---

## 📐 Espacements & Grille

### Spacing Scale (Tailwind)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

### Layout Grid
- Container max-width: 1280px (max-w-7xl)
- Padding horizontal: 24px (px-6)
- Sections spacing: 96px (py-24)

---

## 🎯 Zones d'Attention

### Hiérarchie Visuelle

1. **Hero Title** : Text 7xl, Font 800, Gradient accent
2. **Primary CTA** : Gradient button, Emerald
3. **Feature Cards** : Hover effects, Subtle borders
4. **Secondary Content** : Muted colors, Smaller sizes

### Call-to-Actions

**Primary** : Emerald gradient, bold, large
**Secondary** : Outline, clean, subtle
**Tertiary** : Ghost style, text only

---

## 🌓 Mode Sombre (Future)

```css
.dark {
  --background: 0 0% 8%;           /* Gris très foncé */
  --foreground: 0 0% 98%;          /* Blanc cassé */
  --primary: 0 0% 98%;
  --secondary: 160 84% 45%;        /* Emerald plus clair */
  --accent: 330 81% 65%;           /* Pink plus clair */
  --muted: 0 0% 15%;
  --border: 0 0% 20%;
}
```

---

## ✅ Checklist d'Implémentation

### Phase 1 : Design System
- [ ] Mettre à jour index.css avec nouvelles couleurs
- [ ] Importer police Inter
- [ ] Créer classes utilitaires (buttons, cards, etc.)

### Phase 2 : Composants
- [ ] Refaire Header (minimaliste)
- [ ] Refaire Hero Section (sophistiquée)
- [ ] Refaire Feature Cards
- [ ] Refaire Buttons

### Phase 3 : Pages
- [ ] Landing page (Index.tsx)
- [ ] Page Scan
- [ ] Page Pharmacies
- [ ] Footer

### Phase 4 : Responsive
- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

---

**Inspiration** :
- Stripe.com (sophistication)
- Linear.app (minimalisme)
- Vercel.com (modernité)
- Notion.so (clarté)

**Date de création** : 2025-12-16
