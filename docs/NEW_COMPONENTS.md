# Nouveaux Composants UI

## 🎨 Composants Ajoutés

### 1. **Text Reveal** (`text-reveal.tsx`)
Composants d'animation de texte avec Framer Motion.

#### Composants disponibles :
- `TextReveal` - Animation simple d'un texte
- `TextRevealByWords` - Animation mot par mot
- `TextRevealByCharacters` - Animation caractère par caractère

#### Utilisation :
```tsx
import { TextReveal, TextRevealByWords, TextRevealByCharacters } from '@/components/ui/text-reveal';

// Animation simple
<TextReveal 
  text="Hello World" 
  direction="up" 
  delay={0.5} 
  duration={1}
/>

// Animation mot par mot
<TextRevealByWords 
  text="This is a sentence" 
  stagger={0.2}
/>

// Animation caractère par caractère
<TextRevealByCharacters 
  text="Character by character" 
  stagger={0.05}
/>
```

### 2. **Multi Orbit Semi Circle** (`multi-orbit-semi-circle.tsx`)
Composants d'orbites animées.

#### Composants disponibles :
- `MultiOrbitSemiCircle` - Orbites multiples en demi-cercle
- `OrbitSemiCircle` - Orbite simple en demi-cercle
- `AnimatedOrbit` - Orbite complète animée

#### Utilisation :
```tsx
import { MultiOrbitSemiCircle, OrbitSemiCircle, AnimatedOrbit } from '@/components/ui/multi-orbit-semi-circle';

// Orbites multiples
<MultiOrbitSemiCircle 
  size={200} 
  orbitCount={3} 
  speed={1.5}
  color="#3b82f6"
/>

// Orbite simple
<OrbitSemiCircle 
  size={150} 
  speed={2}
/>

// Orbite complète
<AnimatedOrbit 
  size={180} 
  reverse={true}
/>
```

### 3. **Icons** (`icons.tsx`)
Composants d'icônes animées avec Lucide React.

#### Composants disponibles :
- `AnimatedIcon` - Icône avec animations
- `IconButton` - Bouton avec icône animée
- `IconGrid` - Grille d'icônes

#### Utilisation :
```tsx
import { AnimatedIcon, IconButton, IconGrid, Heart, Star } from '@/components/ui/icons';

// Icône animée
<AnimatedIcon 
  icon={Heart} 
  animation="bounce" 
  size={32}
/>

// Bouton avec icône
<IconButton 
  icon={Star} 
  onClick={() => console.log('clicked')}
  animation="pulse"
  variant="outline"
/>

// Grille d'icônes
<IconGrid 
  icons={[
    { icon: Heart, label: "Love", animation: "bounce" },
    { icon: Star, label: "Star", animation: "spin" }
  ]}
  columns={4}
/>
```

### 4. **Tubelight Navbar** (`tubelight-navbar.tsx`)
Barre de navigation avec effet tubelight.

#### Composants disponibles :
- `TubelightNavbar` - Navigation principale
- `TubelightButton` - Bouton avec effet tubelight

#### Utilisation :
```tsx
import { TubelightNavbar, TubelightButton } from '@/components/ui/tubelight-navbar';

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

// Navigation
<TubelightNavbar 
  items={navItems}
  logo={<div>Logo</div>}
  variant="glass"
  size="md"
/>

// Bouton tubelight
<TubelightButton 
  onClick={() => console.log('clicked')}
  variant="default"
  size="md"
>
  Click me
</TubelightButton>
```

### 5. **Footer Section** (`footer-section.tsx`)
Composants de pied de page avec animations.

#### Composants disponibles :
- `FooterSection` - Pied de page complet
- `NewsletterSignup` - Inscription newsletter
- `SimpleFooter` - Pied de page simple

#### Utilisation :
```tsx
import { FooterSection, NewsletterSignup, SimpleFooter } from '@/components/ui/footer-section';

const sections = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Team", href: "/team" }
    ]
  }
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" }
];

// Pied de page complet
<FooterSection 
  logo={<div>Logo</div>}
  description="Your company description"
  sections={sections}
  socialLinks={socialLinks}
  contactInfo={{
    email: "contact@example.com",
    phone: "+1 234 567 8900"
  }}
  variant="default"
/>

// Inscription newsletter
<NewsletterSignup 
  title="Stay Updated"
  description="Subscribe for updates"
  onSubmit={(email) => console.log(email)}
/>

// Pied de page simple
<SimpleFooter 
  logo={<div>Logo</div>}
  links={[{ label: "Privacy", href: "/privacy" }]}
  socialLinks={socialLinks}
/>
```

## 🎯 Animations Disponibles

### Text Reveal
- `up`, `down`, `left`, `right` - Directions d'animation
- `delay` - Délai avant l'animation
- `duration` - Durée de l'animation
- `stagger` - Délai entre les éléments

### Icons
- `bounce` - Rebond
- `pulse` - Pulsation
- `spin` - Rotation
- `wiggle` - Oscillation
- `float` - Flottement
- `none` - Aucune animation

### Orbit
- `speed` - Vitesse de rotation
- `reverse` - Sens inverse
- `size` - Taille de l'orbite
- `color` - Couleur de l'orbite

## 🎨 Variantes Disponibles

### Tubelight Navbar
- `default` - Style par défaut
- `minimal` - Style minimaliste
- `glass` - Effet de verre

### Footer Section
- `default` - Style par défaut
- `minimal` - Style minimaliste
- `dark` - Style sombre

## 📱 Responsive Design

Tous les composants sont responsive et s'adaptent automatiquement aux différentes tailles d'écran :
- **Mobile** : Layout vertical, navigation hamburger
- **Tablet** : Layout adaptatif
- **Desktop** : Layout horizontal complet

## 🚀 Performance

- **Framer Motion** : Animations optimisées
- **Lazy Loading** : Chargement différé des animations
- **Intersection Observer** : Animations déclenchées au scroll
- **CSS Variables** : Thèmes dynamiques

## 🎨 Personnalisation

Tous les composants acceptent des props `className` pour la personnalisation CSS :

```tsx
<TextReveal 
  text="Custom Text" 
  className="text-4xl font-bold text-blue-600"
/>
```

## 📚 Exemples Complets

### Page d'accueil avec animations
```tsx
import { TextRevealByWords, MultiOrbitSemiCircle, TubelightNavbar } from '@/components/ui';

export default function HomePage() {
  return (
    <div>
      <TubelightNavbar items={navItems} />
      
      <section className="py-20">
        <TextRevealByWords 
          text="Welcome to our amazing website"
          className="text-6xl font-bold text-center"
          stagger={0.1}
        />
        
        <div className="flex justify-center mt-10">
          <MultiOrbitSemiCircle size={300} orbitCount={4} />
        </div>
      </section>
    </div>
  );
}
```

### Footer complet
```tsx
import { FooterSection, NewsletterSignup } from '@/components/ui';

export default function Footer() {
  return (
    <FooterSection 
      logo={<Logo />}
      description="Building amazing experiences"
      sections={sections}
      socialLinks={socialLinks}
      contactInfo={contactInfo}
    >
      <NewsletterSignup onSubmit={handleNewsletter} />
    </FooterSection>
  );
}
```
