# Guide du Responsive Design - Ofika

## 🎯 Objectif
Empêcher le scroll horizontal sur mobile et assurer un comportement responsive correct sur toutes les pages.

## 📱 Règles Responsive

### ✅ **Autorisé :**
- Scroll vertical (haut ↔ bas)
- Zoom et pinch sur mobile
- Navigation tactile normale

### ❌ **Interdit :**
- Scroll horizontal (gauche ↔ droite)
- Débordement de contenu
- Éléments qui sortent de l'écran

## 🛠️ Composants Disponibles

### 1. **ResponsiveContainer**
```tsx
import { ResponsiveContainer } from '@/components/core/layout/ResponsiveContainer'

<ResponsiveContainer>
  <YourContent />
</ResponsiveContainer>
```

### 2. **AuthContainer** (Pages d'authentification)
```tsx
import { AuthContainer } from '@/components/core/layout/ResponsiveContainer'

<AuthContainer>
  <LoginForm />
</AuthContainer>
```

### 3. **DashboardContainer** (Pages du dashboard)
```tsx
import { DashboardContainer } from '@/components/core/layout/ResponsiveContainer'

<DashboardContainer>
  <DashboardContent />
</DashboardContainer>
```

### 4. **MainLayout** (Layout principal)
```tsx
import { MainLayout } from '@/components/core/layout/MainLayout'

<MainLayout>
  <YourPageContent />
</MainLayout>
```

## 🎨 Classes CSS Responsive

### Classes de base :
```css
/* Empêcher le scroll horizontal */
overflow-x-hidden

/* Conteneur responsive */
min-h-screen overflow-x-hidden

/* Conteneur de contenu */
container mx-auto px-4 py-8 overflow-x-hidden
```

### Classes pour mobile :
```css
/* Sur mobile (< 768px) */
@media (max-width: 768px) {
  .container {
    overflow-x: hidden;
    max-width: 100vw;
  }
}
```

## 🔧 Hooks Disponibles

### 1. **useResponsive**
```tsx
import { useResponsive } from '@/lib/hooks/useResponsive'

function MyComponent() {
  const { isMobile, isTablet, isDesktop, width, height } = useResponsive()
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* Contenu */}
    </div>
  )
}
```

### 2. **usePreventHorizontalScroll**
```tsx
import { usePreventHorizontalScroll } from '@/lib/hooks/useResponsive'

function MyComponent() {
  usePreventHorizontalScroll() // Empêche automatiquement le scroll horizontal
  
  return <div>Contenu</div>
}
```

## 📋 Checklist pour les Nouvelles Pages

### ✅ **À faire :**
- [ ] Utiliser `overflow-x-hidden` sur le conteneur principal
- [ ] Tester sur mobile (< 768px)
- [ ] Vérifier qu'aucun élément ne déborde
- [ ] Utiliser les composants ResponsiveContainer
- [ ] Appliquer les hooks useResponsive si nécessaire

### ❌ **À éviter :**
- [ ] Largeurs fixes en pixels sur mobile
- [ ] Éléments avec `width: 100vw` sans contrôle
- [ ] Tableaux sans `table-layout: fixed`
- [ ] Images sans `max-width: 100%`

## 🧪 Test Responsive

### Outils de test :
1. **DevTools Chrome** : Mode responsive
2. **Test sur mobile réel** : iPhone, Android
3. **Test sur tablette** : iPad, Android tablet

### Tailles de test :
- **Mobile** : 375px, 390px, 414px
- **Tablette** : 768px, 1024px
- **Desktop** : 1280px, 1920px

## 🐛 Dépannage

### Problème : Scroll horizontal visible
**Solution :**
```tsx
// Ajouter overflow-x-hidden
<div className="min-h-screen overflow-x-hidden">
  {/* Contenu */}
</div>
```

### Problème : Contenu qui déborde
**Solution :**
```tsx
// Utiliser max-width et box-sizing
<div className="max-w-full box-border">
  {/* Contenu */}
</div>
```

### Problème : Images qui débordent
**Solution :**
```css
img {
  max-width: 100%;
  height: auto;
}
```

## 📚 Exemples d'Usage

### Page d'authentification :
```tsx
export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
```

### Page du dashboard :
```tsx
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}
```

### Page personnalisée :
```tsx
export default function CustomPage() {
  const { isMobile } = useResponsive()
  
  return (
    <MainLayout>
      <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
        {/* Contenu */}
      </div>
    </MainLayout>
  )
}
```

## 🎯 Résultat Attendu

- ✅ **Mobile** : Scroll vertical uniquement, pas de scroll horizontal
- ✅ **Tablette** : Comportement adaptatif
- ✅ **Desktop** : Layout normal avec scroll si nécessaire
- ✅ **Cross-browser** : Compatible Chrome, Safari, Firefox, Edge
