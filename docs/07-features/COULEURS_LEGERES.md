# Couleurs Plus Légères - Guide des Modifications

## 🎨 Modifications Apportées

### 1. **Couleurs Pastel par Défaut**
- **Nouveau schéma** : `pastel` ajouté aux options disponibles
- **Saturation réduite** : De 0.6 à 0.4 pour des couleurs plus douces
- **Luminosité élevée** : De 0.8 à 0.9 pour des tons pastel
- **Intensité réduite** : De 0.08 à 0.05 pour des effets plus subtils

### 2. **Paramètres de Dissipation Ajustés**
- **DENSITY_DISSIPATION** : Augmenté pour une dissipation plus rapide
  - Faible : 0.5 → 1.2
  - Moyen : 1.0 → 1.8  
  - Élevé : 2.0 → 2.5
- **VELOCITY_DISSIPATION** : Augmenté pour des mouvements plus doux
  - Faible : 0.1 → 0.3
  - Moyen : 0.2 → 0.4
  - Élevé : 0.4 → 0.6

### 3. **Forces d'Effet Réduites**
- **SPLAT_FORCE** : Réduit pour des effets plus doux
  - Faible : 3000 → 2000
  - Moyen : 6000 → 4000
  - Élevé : 10000 → 7000
- **Explosions de clic** : Réduites de 10x à 6x l'intensité

## 🌈 Schémas de Couleurs Disponibles

### **Pastel** (Nouveau - Par défaut)
- Couleurs très douces et subtiles
- Parfait pour un effet discret et élégant
- Idéal pour les sites professionnels

### **Brand**
- Couleurs adaptées à la marque
- Fond transparent pour laisser voir les couleurs de la marque
- Équilibre entre visibilité et discrétion

### **Minimal**
- Effet minimaliste
- Couleurs très subtiles
- Pour un effet presque invisible

### **Default**
- Configuration originale
- Couleurs plus vives
- Pour un effet plus visible

## 🎯 Utilisation Recommandée

### **Page d'Accueil**
```tsx
<InteractiveBackground 
  enabled={true}
  intensity="medium"
  colorScheme="pastel" // Couleurs douces par défaut
/>
```

### **Pages Professionnelles**
```tsx
<InteractiveBackground 
  enabled={true}
  intensity="low"
  colorScheme="minimal" // Effet très discret
/>
```

### **Pages de Démonstration**
```tsx
<InteractiveBackground 
  enabled={true}
  intensity="high"
  colorScheme="brand" // Effet plus visible
/>
```

## ⚙️ Contrôles Disponibles

### **Dans la Navigation**
- Bouton "Effet ON/OFF" pour basculer l'effet
- Sauvegarde automatique des préférences

### **Dans le Panneau de Paramètres**
- **Intensité** : Faible, Moyen, Élevé
- **Couleurs** : Défaut, Marque, Minimal, Pastel
- **Réinitialiser** : Retour aux paramètres par défaut

### **Page de Démonstration** (`/demo-splash`)
- Contrôles complets de tous les paramètres
- Test en temps réel des différentes configurations
- Informations techniques détaillées

## 🔧 Personnalisation Avancée

### **Modifier l'Intensité des Couleurs**
Dans `components/ui/splash-cursor.tsx` :
```typescript
function generateColor(): [number, number, number] {
  let c = HSVtoRGB(Math.random(), 0.4, 0.9); // Saturation et luminosité
  c.r *= 0.05; // Intensité finale (réduire pour plus de subtilité)
  c.g *= 0.05;
  c.b *= 0.05;
  return [c.r, c.g, c.b];
}
```

### **Ajuster la Dissipation**
Dans `components/InteractiveBackground.tsx` :
```typescript
DENSITY_DISSIPATION: 1.8, // Augmenter = dissipation plus rapide
VELOCITY_DISSIPATION: 0.4, // Augmenter = mouvements plus doux
```

## 📱 Compatibilité et Performance

### **Appareils Recommandés**
- **Desktop** : Toutes les intensités
- **Tablettes** : Faible à Moyen
- **Mobile** : Faible uniquement

### **Optimisations Automatiques**
- Détection des capacités WebGL
- Adaptation de la résolution
- Gestion intelligente de la mémoire

## 🎨 Résultat Visuel

### **Avant** (Couleurs Vives)
- Effet très visible et coloré
- Couleurs saturées et intenses
- Persistance longue des effets

### **Après** (Couleurs Légères)
- Effet subtil et élégant
- Couleurs pastel douces
- Dissipation rapide pour un effet discret
- Parfait pour un usage professionnel

## 🚀 Prochaines Améliorations

### **Fonctionnalités Futures**
- Thème sombre avec couleurs adaptées
- Animations automatiques subtiles
- Intégration avec les préférences système
- Effets sonores synchronisés (optionnel)

### **Personnalisations Avancées**
- Couleurs personnalisées par l'utilisateur
- Effets saisonniers
- Intégration avec les couleurs de la marque
- API pour les développeurs tiers
