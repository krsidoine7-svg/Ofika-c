# Profils Publics NFC - Documentation

## 🎯 Vue d'ensemble

Le système de profils publics NFC permet d'afficher les cartes de visite numériques créées via le formulaire d'onboarding NFC sous forme de pages publiques élégantes et responsives.

## 📁 Structure des fichiers

```
components/features/card-creator/
├── DesignCardsPublic.tsx          # Composant principal de la carte publique
└── ...

app/
├── nfc-profile/[profileId]/page.tsx    # Page publique dynamique
└── test-pages/
    └── test-nfc-public-profile/page.tsx # Page de test avec données d'exemple
```

## 🚀 Composants créés

### 1. `DesignCardsPublic.tsx`

**Composant principal** qui transforme un `NFCProfile` en carte de visite digitale publique.

#### Props
```typescript
interface DesignCardsPublicProps {
  profile: NFCProfile
  className?: string
}
```

#### Fonctionnalités
- ✅ **4 styles de design** : Classique, Moderne, Minimaliste, Ofika Optimisé
- ✅ **8 thèmes de couleur** : Ofika, Bleu, Vert, Rouge, Violet, Gris, Noir, Blanc
- ✅ **Affichage conditionnel** : Chaque champ s'affiche seulement s'il existe
- ✅ **Animations Framer Motion** : fade-in, scale, stagger
- ✅ **Responsive** : Adapté à tous les écrans
- ✅ **Interactions** : Liens cliquables, bouton CTA

#### Utilisation
```typescript
import { DesignCardsPublic } from '@/components/features/card-creator/DesignCardsPublic'

<DesignCardsPublic profile={nfcProfile} />
```

### 2. `PublicProfileCard`

**Wrapper complet** avec fond et centrage pour les pages publiques.

#### Utilisation
```typescript
import { PublicProfileCard } from '@/components/features/card-creator/DesignCardsPublic'

<PublicProfileCard profile={nfcProfile} />
```

### 3. Page publique `/nfc-profile/[profileId]`

**Page dynamique** qui récupère et affiche un profil NFC depuis la base de données.

#### URL
```
/nfc-profile/{profileId}
```

#### Fonctionnalités
- ✅ **Récupération automatique** depuis Supabase
- ✅ **Gestion des erreurs** (profil non trouvé, inactif)
- ✅ **Pages de chargement** et d'erreur
- ✅ **SEO optimisé** (titre, meta description)
- ✅ **Responsive** et accessible

## 🎨 Styles et Thèmes

### Designs disponibles

| Design | Description | Style |
|--------|-------------|-------|
| `classic` | Design épuré et professionnel | Bordure grise, fond blanc |
| `modern` | Style contemporain avec gradients | Gradients bleu/violet |
| `minimal` | Simplicité et élégance | Bordure fine, fond blanc |
| `ofika-optimized` | Design spécialement conçu pour Ofika | Gradients orange/rose |

### Couleurs disponibles

| Couleur | Code | Gradient |
|---------|------|----------|
| `ofika` | Orange/Rose | `#f97316` → `#ec4899` |
| `blue` | Bleu/Violet | `#3b82f6` → `#8b5cf6` |
| `green` | Vert/Cyan | `#10b981` → `#06b6d4` |
| `red` | Rouge/Orange | `#ef4444` → `#f97316` |
| `purple` | Violet/Rose | `#8b5cf6` → `#ec4899` |
| `gray` | Gris | `#6b7280` → `#374151` |
| `black` | Noir | `#000000` → `#1f2937` |
| `white` | Blanc | `#ffffff` → `#f3f4f6` |

## 📊 Structure des données

### NFCProfile
```typescript
interface NFCProfile {
  id: string
  user_id: string
  full_name: string
  company: string
  job_title: string
  bio?: string
  phone: string
  email: string
  instagram?: string
  tiktok?: string
  linkedin?: string
  other_links?: string
  location?: string
  profile_name: string
  username?: string
  custom_url?: string
  logo_url?: string
  nfc_link: string
  qr_code_url?: string
  design_choice: string
  color_theme: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}
```

## 🧪 Tests

### Page de test
Accédez à `/test-pages/test-nfc-public-profile` pour :
- ✅ Voir 4 profils d'exemple avec différents designs
- ✅ Tester toutes les combinaisons de couleurs
- ✅ Vérifier l'affichage conditionnel des champs
- ✅ Tester les animations et interactions

### Données de test
La page de test inclut :
- **Marie Dubois** - Design Moderne, Couleur Bleue
- **Ahmed Hassan** - Design Minimaliste, Couleur Noire
- **Sophie Martin** - Design Ofika Optimisé, Couleur Ofika
- **Thomas Leroy** - Design Classique, Couleur Verte

## 🔧 Intégration

### 1. Dans votre formulaire NFC
Après la création d'un profil NFC, générez l'URL publique :
```typescript
const publicUrl = `/nfc-profile/${profile.id}`
```

### 2. Dans vos cartes NFC physiques
Incluez l'URL publique dans le lien NFC :
```typescript
const nfcLink = `https://ofika.com/nfc-profile/${profile.id}`
```

### 3. Partage des profils
Les utilisateurs peuvent partager leur profil via :
- URL directe : `https://ofika.com/nfc-profile/{id}`
- QR Code généré automatiquement
- Liens NFC intégrés dans les cartes physiques

## 🎯 Fonctionnalités avancées

### Bouton "Ajouter aux contacts"
Actuellement en mode simulation (`console.log`). Pour l'implémenter :

```typescript
const handleAddToContacts = () => {
  // Option 1: Générer un fichier vCard
  const vCard = generateVCard(profile)
  downloadFile(vCard, `${profile.full_name}.vcf`)
  
  // Option 2: Ouvrir l'app Contacts (mobile)
  window.location.href = `tel:${profile.phone}`
  
  // Option 3: Copier les informations
  navigator.clipboard.writeText(`${profile.full_name}\n${profile.email}\n${profile.phone}`)
}
```

### Analytics et tracking
Ajoutez le tracking des vues :
```typescript
// Dans la page publique
useEffect(() => {
  // Tracker la vue du profil
  trackProfileView(profile.id)
}, [profile.id])
```

## 🚀 Déploiement

1. **Build réussi** ✅ - Le projet compile sans erreurs
2. **Types corrects** ✅ - TypeScript valide tous les composants
3. **Responsive** ✅ - Testé sur mobile et desktop
4. **Accessible** ✅ - Navigation clavier et lecteurs d'écran

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Testez avec la page `/test-pages/test-nfc-public-profile`
3. Consultez les types dans `lib/types/nfc-card-onboarding.ts`

---

**Le système de profils publics NFC est maintenant opérationnel !** 🎉
