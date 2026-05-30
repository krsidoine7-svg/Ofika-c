# 🧙‍♂️ Phase 4 : Wizards d'Onboarding

**Date :** 10 Novembre 2025  
**Statut :** ✅ Complété

---

## 📋 Vue d'ensemble

Deux wizards complets d'onboarding ont été créés :

1. **🪪 Wizard Carte NFC** (Existant, déjà implémenté)
2. **🌐 Wizard Page Publique** (Nouveau, créé dans cette phase)

---

## 🌐 Wizard Page Publique

### Route
`/onboarding/public-page`

### Architecture

```
app/onboarding/public-page/
└── page.tsx (Composant principal)

components/features/onboarding/public-page/
├── Step1BasicInfo.tsx
├── Step2SocialLinks.tsx
├── Step3Customization.tsx
└── Step4Preview.tsx
```

---

## 📊 Étapes du Wizard

### Étape 1 : Informations de base

**Fichier :** `Step1BasicInfo.tsx`

**Champs :**
- ✅ Photo de profil (upload d'image, max 5MB)
- ✅ Nom complet * (requis)
- ✅ Username * (requis, auto-générable)
- ✅ Biographie (optionnel, max 500 caractères)

**Fonctionnalités :**
- Prévisualisation de la photo en temps réel
- Génération automatique du username à partir du nom
- Validation du format du username (minuscules, chiffres, tirets)
- Avatar avec initiale si pas de photo

**Validation :**
```typescript
// Username valide
/^[a-z0-9-]+$/

// Nom complet requis
fullName.trim().length > 0
```

---

### Étape 2 : Liens sociaux

**Fichier :** `Step2SocialLinks.tsx`

**Plateformes prises en charge :**
- 📷 Instagram
- 👥 Facebook  
- 🐦 Twitter/X
- 💼 LinkedIn
- 📹 YouTube
- 🌐 Site web

**Fonctionnalités :**
- Ajout/modification de liens sociaux
- Liens personnalisés illimités (titre + URL)
- Préfixes d'URL automatiques (instagram.com/, etc.)
- Statistiques en temps réel

**Exemple de données :**
```javascript
{
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/votre.nom' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/votre-nom' }
  ],
  customLinks: [
    { title: 'Mon portfolio', url: 'https://monsite.com' },
    { title: 'Mon blog', url: 'https://blog.example.com' }
  ]
}
```

---

### Étape 3 : Personnalisation

**Fichier :** `Step3Customization.tsx`

**Thèmes de couleur :**
| Thème | Couleurs | Usage |
|-------|----------|-------|
| Bleu Océan | `#3B82F6 → #60A5FA` | Professionnel, tech |
| Violet Mystique | `#8B5CF6 → #A78BFA` | Créatif, artistique |
| Rose Passion | `#EC4899 → #F472B6` | Mode, lifestyle |
| Vert Nature | `#10B981 → #34D399` | Écologie, santé |
| Orange Énergie | `#F59E0B → #FBBF24` | Dynamique, sport |
| Noir Élégant | `#1F2937 → #374151` | Luxe, élégance |

**Templates disponibles :**
| Template | Description | Style |
|----------|-------------|-------|
| Minimaliste | Design épuré et moderne | 📄 |
| Carte | Style carte de visite | 🎴 |
| Gradient | Fond avec dégradé coloré | 🌈 |
| Glassmorphism | Effet de verre moderne | 💎 |

**Fonctionnalités :**
- Sélection visuelle avec preview
- Aperçu en temps réel du style choisi
- Affichage du nom et bio avec le thème sélectionné

---

### Étape 4 : Aperçu & Publication

**Fichier :** `Step4Preview.tsx`

**Affichage :**
- ✅ Aperçu complet de la page
- ✅ URL publique finale
- ✅ Liste des réseaux sociaux
- ✅ Liens personnalisés
- ✅ Thème et style appliqués
- ✅ Statistiques récapitulatives

**Actions :**
1. **Si connecté :** Publier directement
2. **Si non connecté :** Redirection vers signup avec callback

**Données affichées :**
```
┌─────────────────────────────────┐
│     [Gradient de couleur]       │
├─────────────────────────────────┤
│          [Avatar]               │
│       Nom Complet               │
│       @username                 │
│       Biographie                │
├─────────────────────────────────┤
│ URL: ofika.com/username         │
├─────────────────────────────────┤
│ Réseaux sociaux: 3              │
│ Liens personnalisés: 2          │
│ Style: Minimaliste              │
└─────────────────────────────────┘
```

---

## 🔄 Flux de Navigation

### Flow normal (utilisateur connecté)
```
/get-started
    ↓ [Clic "Créer ma page publique"]
/onboarding/public-page (Step 1)
    ↓ [Remplir infos]
Step 2 (Liens sociaux)
    ↓ [Ajouter liens]
Step 3 (Personnalisation)
    ↓ [Choisir style]
Step 4 (Aperçu)
    ↓ [Publier]
/{username} (Page publique créée) ✅
```

### Flow avec authentification
```
/get-started
    ↓ [Clic "Créer ma page publique"]
/onboarding/public-page (Step 1-4)
    ↓ [Remplir toutes les étapes]
Step 4 → [Clic "Créer mon compte"]
    ↓
/auth/signup?callbackUrl=/onboarding/public-page?session_id=xxx
    ↓ [S'inscrire]
/onboarding/public-page (restauration auto)
    ↓ [Finaliser]
/{username} (Page publique créée) ✅
```

---

## 🧪 Intégration avec useOnboarding

Le wizard utilise le hook `useOnboarding` créé en Phase 2 :

```typescript
const {
  currentStep,
  wizardData,
  isLoading,
  error,
  goToNextStep,
  goToPrevStep,
  updateWizardData,
  finalize,
  sessionId
} = useOnboarding({
  creationType: 'public_page',
  initialStep: 1,
  totalSteps: 4
})
```

**Fonctionnalités :**
- ✅ Sauvegarde automatique à chaque étape
- ✅ Restauration après authentification
- ✅ Gestion d'erreurs
- ✅ Loading states

---

## 💾 Persistance des Données

### Avant authentification
Les données sont sauvegardées dans `pending_creations` :

```sql
INSERT INTO pending_creations (
  session_id,
  creation_type,
  payload,
  expires_at
) VALUES (
  'generated-uuid',
  'public_page',
  {
    "fullName": "Jean Dupont",
    "username": "jean-dupont",
    "bio": "Développeur web passionné",
    "socialLinks": [...],
    "colorTheme": "blue",
    "template": "minimal"
  },
  NOW() + INTERVAL '24 hours'
)
```

### Après authentification
```typescript
// Finalize convertit pending_creation → profile
await finalize(wizardData)

// Crée un profil dans la table profiles
// Lie au user_id de l'utilisateur connecté
// Supprime l'entrée de pending_creations
```

---

## 🎨 UI/UX Features

### Animations
- Framer Motion pour les transitions entre étapes
- Progress bar animée
- Indicateurs d'étapes avec checkmarks

### Responsive
- Mobile-first design
- Grid adaptatif (1 col mobile, 2-3 cols desktop)
- Navigation tactile optimisée

### Accessibilité
- Labels sémantiques
- Contraste de couleurs AA
- Navigation au clavier
- ARIA labels

### Feedback utilisateur
- Toast notifications (sonner)
- Messages d'erreur contextuels
- États de loading
- Preview en temps réel

---

## 🔒 Sécurité

### Validation côté client
```typescript
// Username
const usernameRegex = /^[a-z0-9-]+$/

// Photo
if (file.size > 5 * 1024 * 1024) {
  toast.error('Max 5MB')
}

// URLs
const safeUrlRegex = /^https?:\/\/.+$/
```

### Validation côté serveur
- Vérification de l'existence du username
- Sanitization des inputs
- Upload sécurisé des images
- Rate limiting

---

## 📊 Statistiques & Analytics

Le wizard track automatiquement :
- Étape actuelle
- Temps passé par étape
- Taux d'abandon
- Conversion finale

---

## 🧪 Tests à effectuer

### Tests manuels
- [ ] Remplir toutes les étapes (flow complet)
- [ ] Retour en arrière fonctionne
- [ ] Upload de photo
- [ ] Génération automatique du username
- [ ] Ajout de liens sociaux
- [ ] Ajout de liens personnalisés
- [ ] Changement de thème
- [ ] Aperçu final correct
- [ ] Publication (avec/sans auth)
- [ ] Redirection vers la page créée

### Edge cases
- [ ] Username déjà pris
- [ ] Photo trop volumineuse
- [ ] Formulaire incomplet
- [ ] Connexion internet perdue
- [ ] Session expirée

---

## 🚀 Prochaines améliorations

- [ ] Preview en live dans une iframe
- [ ] Import de données depuis LinkedIn
- [ ] Templates additionnels
- [ ] Thèmes personnalisés (color picker)
- [ ] Support de GIFs pour l'avatar
- [ ] Drag & drop pour réorganiser les liens
- [ ] QR Code generator intégré
- [ ] Analytics preview (estimé de trafic)

---

## 📝 Commandes utiles

```bash
# Démarrer le dev server
npm run dev

# Ouvrir le wizard
http://localhost:3000/onboarding/public-page

# Tester depuis /get-started
http://localhost:3000/get-started
```

---

## 🔗 Fichiers liés

- `/app/onboarding/public-page/page.tsx`
- `/components/features/onboarding/public-page/*.tsx`
- `/lib/hooks/useOnboarding.ts`
- `/lib/services/onboarding.service.ts`
- `/lib/types/onboarding.ts`

---

**Créé le :** 10 Novembre 2025  
**Dernière mise à jour :** 10 Novembre 2025  
**Statut :** ✅ Phase 4 complétée - Wizards opérationnels
