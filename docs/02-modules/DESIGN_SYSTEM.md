# 🎨 OFIKA DESIGN SYSTEM

> **Documentation complète du système de design Ofika**  
> *Version 1.0.0 - Guide de référence pour les développeurs*

---

## 📋 Table des Matières

- [🎨 Palette de Couleurs](#-palette-de-couleurs)
- [�� Typographie](#-typographie)
- [📏 Espacements et Tailles](#-espacements-et-tailles)
- [📱 Breakpoints Responsives](#-breakpoints-responsives)
- [🎯 Cibles Tactiles](#-cibles-tactiles)
- [�� Classes Utilitaires](#-classes-utilitaires)
- [�� Thèmes CSS](#-thèmes-css)
- [🛠️ Utilisation](#️-utilisation)
- [�� Exemples de Code](#-exemples-de-code)

---

## �� Palette de Couleurs

### Couleurs Principales (Mode Clair)

| Couleur | Valeur | Description | Usage |
|---------|--------|-------------|-------|
| **Background** | `oklch(1 0 0)` | Blanc pur | Arrière-plan principal |
| **Foreground** | `oklch(0.145 0 0)` | Noir profond | Texte principal |
| **Primary** | `oklch(0.145 0 0)` | Noir | Éléments principaux |
| **Primary Foreground** | `oklch(0.985 0 0)` | Blanc cassé | Texte sur éléments principaux |

### Couleurs Secondaires

| Couleur | Valeur | Description | Usage |
|---------|--------|-------------|-------|
| **Secondary** | `oklch(0.97 0 0)` | Gris très clair | Éléments secondaires |
| **Muted** | `oklch(0.97 0 0)` | Gris très clair | Éléments atténués |
| **Accent** | `oklch(0.97 0 0)` | Gris très clair | Éléments d'accent |
| **Border** | `oklch(0.922 0 0)` | Gris clair | Bordures |
| **Input** | `oklch(0.922 0 0)` | Gris clair | Champs de saisie |

### Couleurs d'État

| Couleur | Valeur | Description | Usage |
|---------|--------|-------------|-------|
| **Destructive** | `oklch(0.577 0.245 27.325)` | Rouge orangé | Actions destructives |
| **Destructive Foreground** | `oklch(0.985 0 0)` | Blanc cassé | Texte sur éléments destructifs |

### 🧡💗 Couleurs de Marque Ofika

| Couleur | Valeur | Hex | Description | Usage |
|---------|--------|-----|-------------|-------|
| **Ofika Orange** | `oklch(0.7 0.15 45)` | `#d2691e` | Orange vif | Marque principale |
| **Ofika Pink** | `oklch(0.75 0.12 350)` | `#b91c7c` | Rose vif | Marque secondaire |
| **Ofika Gradient** | `linear-gradient(135deg, #d2691e, #cc5500, #b91c7c)` | - | Dégradé orange-rose | Boutons, accents |

### Couleurs de Graphiques

| Couleur | Valeur | Description | Usage |
|---------|--------|-------------|-------|
| **Chart 1** | `oklch(0.646 0.222 41.116)` | Orange | Graphiques |
| **Chart 2** | `oklch(0.6 0.118 184.704)` | Bleu | Graphiques |
| **Chart 3** | `oklch(0.398 0.07 227.392)` | Bleu foncé | Graphiques |
| **Chart 4** | `oklch(0.828 0.189 84.429)` | Vert | Graphiques |
| **Chart 5** | `oklch(0.769 0.188 70.08)` | Vert clair | Graphiques |

### Couleurs Sidebar

| Couleur | Valeur | Description | Usage |
|---------|--------|-------------|-------|
| **Sidebar Background** | `oklch(0.985 0 0)` | Blanc cassé | Arrière-plan sidebar |
| **Sidebar Primary** | `oklch(0.205 0 0)` | Gris foncé | Éléments principaux sidebar |
| **Sidebar Accent** | `oklch(0.97 0 0)` | Gris très clair | Éléments d'accent sidebar |

---

## 🔤 Typographie

### Polices Principales

| Police | Valeur | Description | Usage |
|--------|--------|-------------|-------|
| **Font Sans** | `var(--font-inter), Inter, system-ui, sans-serif` | Police principale | Texte général |
| **Font Mono** | `ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace` | Police monospace | Code, données |

### Tailles de Police

| Taille | Valeur | Pixels | Usage |
|--------|--------|--------|-------|
| **xs** | `0.75rem` | 12px | Texte très petit |
| **sm** | `0.875rem` | 14px | Texte petit |
| **base** | `1rem` | 16px | Texte de base |
| **lg** | `1.125rem` | 18px | Texte grand |
| **xl** | `1.25rem` | 20px | Texte très grand |
| **2xl** | `1.5rem` | 24px | Titres petits |
| **3xl** | `1.875rem` | 30px | Titres moyens |
| **4xl** | `2.25rem` | 36px | Titres grands |
| **5xl** | `3rem` | 48px | Titres très grands |
| **6xl** | `3.75rem` | 60px | Titres énormes |

### Hauteurs de Ligne

| Hauteur | Valeur | Usage |
|---------|--------|-------|
| **none** | `1` | Texte compact |
| **tight** | `1.25` | Titres |
| **snug** | `1.375` | Sous-titres |
| **normal** | `1.5` | Texte de base |
| **relaxed** | `1.625` | Texte confortable |
| **loose** | `2` | Texte espacé |

### Poids de Police

| Poids | Valeur | Usage |
|-------|--------|-------|
| **thin** | `100` | Texte très fin |
| **extralight** | `200` | Texte extra fin |
| **light** | `300` | Texte fin |
| **normal** | `400` | Texte normal |
| **medium** | `500` | Texte moyen |
| **semibold** | `600` | Texte semi-gras |
| **bold** | `700` | Texte gras |
| **extrabold** | `800` | Texte extra gras |
| **black** | `900` | Texte très gras |

### Classes Typographiques Responsives

```css
/* Texte responsive */
.text-responsive { @apply text-sm sm:text-base lg:text-lg; }

/* Titre responsive */
.heading-responsive { @apply text-xl sm:text-2xl lg:text-3xl xl:text-4xl; }

/* Sous-titre responsive */
.subheading-responsive { @apply text-lg sm:text-xl lg:text-2xl; }

/* Légende responsive */
.caption-responsive { @apply text-xs sm:text-sm; }
```

---

## 📏 Espacements et Tailles

### Rayons de Bordure

| Rayon | Valeur | Pixels | Usage |
|-------|--------|--------|-------|
| **none** | `0` | 0px | Pas de rayon |
| **sm** | `calc(var(--radius) - 4px)` | 6px | Petits éléments |
| **md** | `calc(var(--radius) - 2px)` | 8px | Éléments moyens |
| **lg** | `var(--radius)` | 10px | Éléments standards |
| **xl** | `calc(var(--radius) + 4px)` | 14px | Grands éléments |
| **2xl** | `calc(var(--radius) + 8px)` | 18px | Très grands éléments |
| **3xl** | `calc(var(--radius) + 12px)` | 22px | Éléments énormes |
| **full** | `9999px` | - | Complètement arrondi |

### Espacements (Padding/Margin)

| Espacement | Valeur | Pixels | Usage |
|------------|--------|--------|-------|
| **0** | `0` | 0px | Pas d'espacement |
| **1** | `0.25rem` | 4px | Espacement très petit |
| **2** | `0.5rem` | 8px | Espacement petit |
| **3** | `0.75rem` | 12px | Espacement moyen-petit |
| **4** | `1rem` | 16px | Espacement standard |
| **5** | `1.25rem` | 20px | Espacement moyen |
| **6** | `1.5rem` | 24px | Espacement grand |
| **8** | `2rem` | 32px | Espacement très grand |
| **10** | `2.5rem` | 40px | Espacement énorme |
| **12** | `3rem` | 48px | Espacement maximum |
| **16** | `4rem` | 64px | Espacement extra |
| **20** | `5rem` | 80px | Espacement géant |
| **24** | `6rem` | 96px | Espacement colossal |
| **32** | `8rem` | 128px | Espacement monumental |

### Classes d'Espacement Responsives

```css
/* Padding responsive */
.padding-responsive { @apply p-4 sm:p-6 lg:p-8; }

/* Margin responsive */
.margin-responsive { @apply m-4 sm:m-6 lg:m-8; }

/* Padding horizontal responsive */
.padding-x-responsive { @apply px-4 sm:px-6 lg:px-8; }

/* Padding vertical responsive */
.padding-y-responsive { @apply py-4 sm:py-6 lg:py-8; }
```

---

## 📱 Breakpoints Responsives

| Breakpoint | Valeur | Pixels | Usage |
|------------|--------|--------|-------|
| **sm** | `640px` | 640px | Mobile large |
| **md** | `768px` | 768px | Tablette |
| **lg** | `1024px` | 1024px | Desktop petit |
| **xl** | `1280px` | 1280px | Desktop |
| **2xl** | `1536px` | 1536px | Desktop large |

---

## 🎯 Cibles Tactiles

| Taille | Valeur | Usage |
|--------|--------|-------|
| **min** | `min-h-[44px] min-w-[44px]` | Taille minimale recommandée |
| **sm** | `min-h-[32px] min-w-[32px]` | Petits éléments tactiles |
| **md** | `min-h-[44px] min-w-[44px]` | Taille standard |
| **lg** | `min-h-[56px] min-w-[56px]` | Grands éléments tactiles |

---

## �� Classes Utilitaires

### Gradients Ofika

```css
/* Gradient Ofika de base */
.ofika-gradient {
  background: linear-gradient(135deg, #d2691e, #cc5500, #b91c7c);
}

/* Gradient Ofika pour texte */
.ofika-text-gradient {
  background: linear-gradient(to right, #d2691e, #b91c7c);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

/* Gradient Ofika au survol */
.ofika-gradient-hover:hover {
  background: linear-gradient(135deg, #b8591a, #b34700, #a0176a);
}
```

### Animations

```css
/* Animation fadeInUp */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation pulse-glow */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(210, 105, 30, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(210, 105, 30, 0.8);
  }
}

/* Animation bounce-in */
@keyframes bounce-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Transitions

```css
/* Transition fluide */
.transition-smooth {
  transition: all 0.3s ease-in-out;
}

/* Transition rapide */
.transition-fast {
  transition: all 0.15s ease-in-out;
}

/* Transition lente */
.transition-slow {
  transition: all 0.5s ease-in-out;
}

/* Transition avec rebond */
.transition-bounce {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Classes Responsives

```css
/* Affichage mobile uniquement */
.mobile-only { @apply block sm:hidden; }

/* Affichage tablette uniquement */
.tablet-only { @apply hidden sm:block lg:hidden; }

/* Affichage desktop uniquement */
.desktop-only { @apply hidden lg:block; }

/* Affichage mobile + tablette */
.mobile-tablet { @apply block lg:hidden; }

/* Affichage tablette + desktop */
.tablet-desktop { @apply hidden sm:block; }
```

### Grilles Responsives

```css
/* Grille responsive 1 */
.grid-responsive-1 { @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4; }

/* Grille responsive 2 */
.grid-responsive-2 { @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6; }

/* Grille responsive 3 */
.grid-responsive-3 { @apply grid-cols-1 md:grid-cols-2 xl:grid-cols-3; }
```

### Flex Responsives

```css
/* Flex responsive */
.flex-responsive { @apply flex-col sm:flex-row; }

/* Flex responsive inversé */
.flex-responsive-reverse { @apply flex-col-reverse sm:flex-row; }

/* Flex responsive avec wrap */
.flex-responsive-wrap { @apply flex-wrap sm:flex-nowrap; }
```

---

## �� Thèmes CSS

### Mode Clair

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.145 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.145 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.45 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.145 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.145 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --radius: 0.625rem;
}
```

### Mode Sombre

```css
.dark {
  --background: oklch(0.09 0 0);
  --foreground: oklch(0.98 0 0);
  --primary: oklch(0.98 0 0);
  --primary-foreground: oklch(0.09 0 0);
  --secondary: oklch(0.15 0 0);
  --secondary-foreground: oklch(0.98 0 0);
  --muted: oklch(0.15 0 0);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.15 0 0);
  --accent-foreground: oklch(0.98 0 0);
  --border: oklch(0.15 0 0);
  --input: oklch(0.15 0 0);
  --ring: oklch(0.98 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.98 0 0);
  --radius: 0.625rem;
}
```

---

## 🛠️ Utilisation

### Import des Classes

```typescript
// Import des classes utilitaires
import { customClasses } from '@/lib/design-system';

// Utilisation des gradients
const gradientClass = customClasses.gradients.ofika;
const textGradientClass = customClasses.gradients.ofikaText;

// Utilisation des animations
const animationClass = customClasses.animations.fadeInUp;

// Utilisation des transitions
const transitionClass = customClasses.transitions.smooth;
```

### Utilisation des Couleurs

```typescript
// Import des couleurs
import { colors } from '@/lib/design-system';

// Utilisation des couleurs
const primaryColor = colors.primary;
const ofikaOrange = colors.ofika.orange;
const ofikaGradient = colors.ofika.gradient;
```

### Utilisation des Espacements

```typescript
// Import des espacements
import { spacing } from '@/lib/design-system';

// Utilisation des rayons
const borderRadius = spacing.radius.lg;

// Utilisation des espacements
const padding = spacing.space[4];
```

---

## 📚 Exemples de Code

### Bouton avec Gradient Ofika

```tsx
import { ofikaGradient, ofikaTextGradient } from '@/lib/design-system';

export function OfikaButton({ children, ...props }) {
  return (
    <button
      className={`${ofikaGradient('to-br')} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Titre avec Gradient de Texte

```tsx
import { ofikaTextGradient } from '@/lib/design-system';

export function OfikaTitle({ children }) {
  return (
    <h1 className={`text-4xl font-bold ${ofikaTextGradient()}`}>
      {children}
    </h1>
  );
}
```

### Carte avec Animation

```tsx
import { customClasses } from '@/lib/design-system';

export function AnimatedCard({ children }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${customClasses.animations.fadeInUp} ${customClasses.transitions.smooth}`}>
      {children}
    </div>
  );
}
```

### Grille Responsive

```tsx
import { customClasses } from '@/lib/design-system';

export function ResponsiveGrid({ children }) {
  return (
    <div className={`grid gap-6 ${customClasses.grids.responsive}`}>
      {children}
    </div>
  );
}
```

---

## 🎯 Bonnes Pratiques

### ✅ À Faire

- Utiliser les classes utilitaires prédéfinies
- Respecter les breakpoints responsives
- Utiliser les cibles tactiles pour les éléments interactifs
- Appliquer les transitions fluides
- Tester sur différentes tailles d'écran

### ❌ À Éviter

- Créer des classes CSS personnalisées sans nécessité
- Ignorer les cibles tactiles sur mobile
- Utiliser des couleurs hardcodées au lieu des variables CSS
- Négliger l'accessibilité
- Oublier de tester le mode sombre

---

## 📞 Support

Pour toute question concernant le design system Ofika, contactez l'équipe de développement.

---

*Dernière mise à jour : Janvier 2025*
