# 🚀 Page /get-started

**Route :** `/get-started`  
**Type :** Page publique (non protégée)  
**Objectif :** Permettre aux visiteurs de choisir entre créer une carte NFC ou une page publique

---

## 🎨 Design

### Layout
- Header fixe avec logo Ofika + lien "Se connecter"
- Section hero avec titre accrocheur
- 2 cartes côte à côte (responsive)
- Section comparaison
- Footer simple

### Animations
- Framer Motion pour les transitions
- Effet hover sur les cartes (scale + shadow)
- Animations d'entrée (fade + slide)

### Couleurs
- **Carte NFC :** Gradient orange-pink (identité Ofika)
- **Page Publique :** Gradient blue-purple (web/digital)
- Badges : Orange (Populaire), Green (Gratuit)

---

## 🔀 Navigation

### Carte NFC → `/onboarding/nfc-card`
Wizard en 4 étapes :
1. Choix du design
2. Informations personnelles
3. Informations de contact
4. Preview et confirmation

### Page Publique → `/onboarding/public-page`
Wizard en 4 étapes :
1. Infos de base (nom, bio, photo)
2. Liens sociaux
3. Personnalisation (couleurs, template)
4. Preview et confirmation

---

## 📊 Fonctionnalités

### Carte NFC
- **Prix :** 14 600 XOF + livraison
- **Badge :** "Populaire" (orange)
- **Features :**
  - Carte physique NFC premium
  - Design personnalisable
  - QR Code intégré
  - Profil digital
  - Analytics
  - Livraison 5-7 jours

### Page Publique
- **Prix :** Gratuit
- **Badge :** "Gratuit" (vert)
- **Features :**
  - URL personnalisée
  - Liens sociaux illimités
  - QR Code téléchargeable
  - Templates pro
  - Analytics basiques
  - En ligne en 5 min

---

## 🎯 UX Considerations

### Aide au choix
Section "Pas sûr de votre choix ?" avec 2 colonnes :
- Carte NFC si : réseautage en personne, événements, impression
- Page Publique si : débutant, test gratuit, partage en ligne

### Microcopy
- "💳 Paiement sécurisé • 🚚 Livraison gratuite dès 2 cartes"
- "✨ Créez votre page en quelques clics • 🌐 Accessible 24/7"
- "Déjà un compte ? Se connecter"

### Responsive
- Desktop : 2 colonnes
- Mobile : 1 colonne empilée
- Touch-friendly sur mobile

---

## 🧪 Tests

### À tester
- [ ] Clic sur carte NFC → redirige vers `/onboarding/nfc-card`
- [ ] Clic sur page publique → redirige vers `/onboarding/public-page`
- [ ] Hover effects fonctionnent
- [ ] Animations smooth
- [ ] Responsive mobile
- [ ] Lien "Se connecter" fonctionne
- [ ] Accessibilité (keyboard navigation)

---

## 🔄 Améliorations futures

- [ ] A/B testing des CTAs
- [ ] Video demo de chaque option
- [ ] Témoignages clients
- [ ] FAQ intégrée
- [ ] Calculateur de ROI (carte NFC)
- [ ] Preview en temps réel des designs

---

## 📝 Notes techniques

### Dépendances
- `framer-motion` : Animations
- `lucide-react` : Icônes
- shadcn/ui : Button, Card, Badge

### État
- `hoveredCard` : Track quelle carte est survolée
- Animations déclenchées au mount

### Performance
- Images optimisées (si ajoutées)
- Code splitting automatique (Next.js)
- Preload des routes d'onboarding

---

**Créé le :** 10 Novembre 2025  
**Dernière mise à jour :** 10 Novembre 2025
