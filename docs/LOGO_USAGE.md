# 🎨 Guide d'utilisation du Logo Ofika

## Import

```tsx
import { Logo } from '@/components/core/ui/logo'
```

## Exemples d'utilisation

### Logo simple (défaut)
```tsx
<Logo />
<Logo size="md" />
```

### Logo avec texte "Ofika"
```tsx
<Logo showText />
<Logo size="lg" showText />
```

### Logo blanc (pour fonds sombres)
```tsx
<Logo variant="white" />
<Logo size="md" variant="white" showText />
```

### Logo avec fond (app icon style)
```tsx
<Logo variant="icon" />
<Logo size="xl" variant="icon" />
```

### Logo secondaire (footer/secondaire)
```tsx
<Logo variant="secondary" />
<Logo size="md" variant="secondary" showText />
```

## Props

| Prop | Type | Options | Défaut | Description |
|------|------|---------|--------|-------------|
| `size` | string | `sm`, `md`, `lg`, `xl` | `md` | Taille du logo |
| `showText` | boolean | `true`, `false` | `false` | Afficher le texte "Ofika" |
| `variant` | string | `color`, `white`, `icon`, `secondary` | `color` | Variante du logo |
| `className` | string | - | - | Classes CSS supplémentaires |

## Quand utiliser chaque variante

### `variant="color"` (défaut)
- Navigation principale
- Headers
- Éléments sur fond clair
- **Logo utilisé**: `logo-main.svg` (noir et gris)

### `variant="white"`
- Footers sombres
- Éléments sur fond foncé
- Navigation sur fond coloré
- **Logo utilisé**: `logo-white.svg` (orange avec blanc)

### `variant="icon"`
- Pages de chargement
- Splash screens
- Icônes d'application
- États de chargement
- **Logo utilisé**: `logo-icon.svg` (blanc avec dégradés orange)

### `variant="secondary"`
- Footer alternatif
- Pages secondaires
- Variante de marque
- **Logo utilisé**: `logo-secondary.svg` (blanc avec bordure noire et orange)

## Tailles recommandées

- **Header navigation**: `size="sm"` avec `showText`
- **Hero sections**: `size="xl"` ou `size="lg"`
- **Footer**: `size="sm"` avec `showText`
- **Loading states**: `size="md"` variant `icon`
- **Auth pages**: `size="md"` variant `icon`

## Fichiers logo disponibles

Les logos sont stockés dans `/public/assets/logos/`:

- `/public/assets/logos/logo-main.svg` - Logo principal (noir et gris) - Navigation principale
- `/public/assets/logos/logo-white.svg` - Logo orange avec blanc - Pour fonds sombres
- `/public/assets/logos/logo-icon.svg` - Logo blanc avec dégradés orange - Splash/login
- `/public/assets/logos/logo-secondary.svg` - Logo blanc avec bordure noire et orange - Footer/secondaire

## Notes importantes

✅ **À faire**
- Utiliser le composant `<Logo />` pour tous les logos
- Choisir la bonne variante selon le fond
- Adapter la taille au contexte
- Respecter les proportions originales des logos

❌ **À éviter**
- Créer des logos en dur avec des divs
- Modifier les couleurs du logo
- Utiliser des images PNG/JPG pour le logo
- Déformer les proportions
- Ajouter des fonds ou effets sur les logos (ils sont déjà complets)

## Exemples concrets

```tsx
// Navigation header
<Link href="/">
  <Logo size="sm" showText />
</Link>

// Footer sombre
<footer className="bg-gray-900">
  <Logo size="sm" showText variant="white" />
</footer>

// Page de chargement
<div className="loading-screen">
  <Logo size="md" variant="icon" />
  <p>Chargement...</p>
</div>

// Hero section
<div className="hero">
  <Logo size="xl" />
  <h1>Bienvenue sur Ofika</h1>
</div>
```
