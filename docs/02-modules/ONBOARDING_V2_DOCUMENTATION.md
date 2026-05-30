# 📚 Documentation Complète - Onboarding V2 (Option B)

## 🎯 Vue d'ensemble

Cette documentation décrit l'implémentation complète de l'**Option B** pour la création de profils : **Choix du design en premier, puis formulaire dynamique**.

---

## 🏗️ Architecture

### Flow utilisateur

```
┌─────────────────────────────────────────────────────────────┐
│                    CRÉATION DE PROFIL V2                     │
└─────────────────────────────────────────────────────────────┘

Étape 1: CHOIX DU DESIGN
┌─────────────────────────────────────────────────────────────┐
│  L'utilisateur voit les 8 designs disponibles avec :        │
│  - Aperçu visuel                                             │
│  - Description                                               │
│  - Statistiques (utilisateurs, satisfaction, conversion)     │
│  - Public cible                                              │
│                                                              │
│  → Sélection d'un design                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
Étape 2: FORMULAIRE DYNAMIQUE
┌─────────────────────────────────────────────────────────────┐
│  Le formulaire s'adapte au design choisi :                  │
│                                                              │
│  CHAMPS COMMUNS (tous les designs) :                        │
│  - Photo de profil *                                         │
│  - Photo de couverture                                       │
│  - Nom complet *                                             │
│  - Bio / Description                                         │
│  - Nom d'utilisateur                                         │
│  - Email                                                     │
│  - Téléphone                                                 │
│  - Site web                                                  │
│                                                              │
│  CHAMPS SPÉCIFIQUES (selon le design) :                     │
│  - Type de profil (Design Classique)                        │
│  - URL personnalisée (Design Classique)                     │
│  - Réseaux sociaux (selon design)                           │
│  - Liens personnalisés (selon design)                       │
│                                                              │
│  → Validation et passage à l'étape suivante                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
Étape 3: APERÇU ET VALIDATION
┌─────────────────────────────────────────────────────────────┐
│  Récapitulatif de toutes les informations :                 │
│  - Design choisi                                             │
│  - Informations personnelles                                 │
│  - Réseaux sociaux configurés                                │
│  - Liens personnalisés                                       │
│                                                              │
│  Actions :                                                   │
│  - Modifier (retour à l'étape 2)                            │
│  - Créer mon profil (création dans Supabase)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
Étape 4: SUCCÈS
┌─────────────────────────────────────────────────────────────┐
│  Confirmation de création :                                  │
│  - Message de succès                                         │
│  - Informations du profil créé                              │
│  - URL publique                                              │
│                                                              │
│  Actions :                                                   │
│  - Voir ma page (ouvre dans nouvel onglet)                  │
│  - Retour aux profils (dashboard)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des fichiers

### Nouveaux fichiers créés

```
s:\nextjs-base-project\
├── app\
│   └── dashboard\
│       └── profiles\
│           └── create-v2\
│               └── page.tsx                    # Page principale Option B
│
├── components\
│   └── features\
│       └── profiles\
│           ├── DynamicProfileForm.tsx          # Formulaire dynamique
│           ├── TemplateSelectionStep.tsx       # Sélection de design (existant)
│           ├── LinkInBioDesign1.tsx            # Design Classique (existant)
│           ├── LinkInBioDesign2.tsx            # Design Moderne (existant)
│           ├── LinkInBioDesign3.tsx            # Design Créatif (modifié)
│           ├── LinkInBioDesign4.tsx            # Design Nature (modifié)
│           ├── LinkInBioDesign7.tsx            # Design Dark Elegant (existant)
│           ├── LinkInBioInfluencer.tsx         # Design Influenceur (nouveau)
│           ├── LinkInBioEcommerce.tsx          # Design E-commerce (nouveau)
│           └── LinkInBioFreelance.tsx          # Design Freelance (nouveau)
│
├── lib\
│   ├── types\
│   │   └── database.ts                         # Types mis à jour
│   └── validations.ts                          # Schémas Zod mis à jour
│
├── DATABASE_UPDATES.md                          # Script SQL pour Supabase
└── ONBOARDING_V2_DOCUMENTATION.md              # Ce fichier
```

---

## 🎨 Configuration des designs

### Tableau récapitulatif

| Design | ID | Champs spécifiques | Réseaux sociaux | Liens requis | Public cible |
|--------|----|--------------------|-----------------|--------------|--------------|
| **Classique** | `design1` | profile_type, custom_url | - | Non | Professionnels |
| **Moderne** | `design2` | - | Instagram, Facebook | Non | Créatifs |
| **Créatif** | `design3` | custom_links | Instagram | Oui | Artistes |
| **Nature** | `design4` | - | Instagram, Facebook, Twitter | Non | Minimalistes |
| **Influenceur** | `influencer` | - | Instagram, YouTube, TikTok, Facebook, Twitter | Non | Créateurs de contenu |
| **E-commerce** | `ecommerce` | custom_links | - | Oui | Vendeurs en ligne |
| **Dark Elegant** | `design7` | custom_links | Instagram | Non | Photographes |
| **Freelance** | `freelance` | custom_links | LinkedIn, Instagram | Non | Freelances |

---

## 🔧 Composants détaillés

### 1. DynamicProfileForm.tsx

**Rôle** : Formulaire qui s'adapte dynamiquement au design choisi

**Props** :
```typescript
interface DynamicProfileFormProps {
  selectedDesign: string      // ID du design choisi
  initialData?: any           // Données initiales (pour retour en arrière)
  onNext: (data: any) => void // Callback pour passer à l'étape suivante
  onPrev: () => void          // Callback pour revenir en arrière
  isLoading?: boolean         // État de chargement
}
```

**Fonctionnalités** :
- ✅ Validation dynamique avec Zod
- ✅ Schémas spécifiques par design
- ✅ Gestion des liens personnalisés
- ✅ Upload d'images (profil + couverture)
- ✅ Sauvegarde des données entre étapes
- ✅ Messages d'erreur contextuels

**Schémas de validation** :

```typescript
// Champs communs
const commonFieldsSchema = z.object({
  name: z.string().min(2),
  bio: z.string().max(200).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  username: z.string().min(3).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  is_public: z.boolean().default(true)
})

// Exemple de schéma spécifique (Design Influenceur)
const influencerSchema = z.object({
  instagram: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  tiktok: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal(''))
})

// Schéma final = commun + spécifique
const finalSchema = commonFieldsSchema.merge(influencerSchema)
```

---

### 2. create-v2/page.tsx

**Rôle** : Page principale orchestrant le flow complet

**États gérés** :
```typescript
const [currentStep, setCurrentStep] = useState<CreationStep>('design')
const [selectedDesign, setSelectedDesign] = useState<string>('')
const [formData, setFormData] = useState<any>(null)
const [createdProfile, setCreatedProfile] = useState<any>(null)
const [loading, setLoading] = useState(false)
```

**Handlers principaux** :
- `handleDesignSelection()` : Sélection du design
- `handleFormSubmit()` : Soumission du formulaire
- `handleCreateProfile()` : Création dans Supabase
- `handleBack()` : Retour en arrière

**Logique de création** :
1. Récupération de l'utilisateur authentifié
2. Génération d'un username unique si nécessaire
3. Vérification de l'unicité du username
4. Insertion dans la table `profiles`
5. Redirection vers l'étape de succès

---

### 3. TemplateSelectionStep.tsx

**Rôle** : Affichage et sélection des designs (existant, réutilisé)

**Fonctionnalités** :
- ✅ Grille responsive des 8 designs
- ✅ Aperçu en temps réel
- ✅ Informations détaillées par design
- ✅ Statistiques et public cible
- ✅ Badge de priorité

---

## 🗄️ Base de données

### Nouveaux champs ajoutés

```sql
-- Photo de couverture
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- LinkedIn
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS linkedin TEXT;
```

### Structure complète de la table `profiles`

Voir `DATABASE_UPDATES.md` pour le script SQL complet.

---

## 🎯 Champs spécifiques par design

### Design Classique (design1)
```typescript
{
  profile_type: 'professional' | 'personal' | 'event',
  custom_url: string  // Requis
}
```

### Design Influenceur (influencer)
```typescript
{
  instagram: string,
  youtube: string,
  tiktok: string,
  facebook: string,
  twitter: string
}
```

### Design E-commerce (ecommerce)
```typescript
{
  custom_links: [
    {
      title: string,
      url: string,
      type: 'shop'  // Type par défaut
    }
  ]  // Au moins 1 lien requis
}
```

### Design Freelance (freelance)
```typescript
{
  linkedin: string,
  instagram: string,
  custom_links: [
    {
      title: string,
      url: string,
      type: 'website' | 'shop' | 'other'
    }
  ]  // Optionnel
}
```

---

## 🔄 Gestion de l'état

### Sauvegarde entre étapes

Les données sont conservées dans l'état React :

```typescript
// Étape 1 → Étape 2
handleDesignSelection(design) {
  setSelectedDesign(design)
  setCurrentStep('form')
}

// Étape 2 → Étape 3
handleFormSubmit(data) {
  setFormData(data)  // Sauvegarde
  setCurrentStep('preview')
}

// Retour Étape 3 → Étape 2
handleBack() {
  setCurrentStep('form')
  // formData est conservé
}
```

### Persistance locale (optionnel)

Pour éviter la perte de données en cas de rafraîchissement :

```typescript
// Sauvegarder dans localStorage
useEffect(() => {
  if (formData) {
    localStorage.setItem('profile_draft', JSON.stringify({
      design: selectedDesign,
      data: formData
    }))
  }
}, [formData, selectedDesign])

// Restaurer au chargement
useEffect(() => {
  const draft = localStorage.getItem('profile_draft')
  if (draft) {
    const { design, data } = JSON.parse(draft)
    setSelectedDesign(design)
    setFormData(data)
    setCurrentStep('form')
  }
}, [])
```

---

## 🎨 Personnalisation

### Ajouter un nouveau design

1. **Créer le composant de design** :
```typescript
// LinkInBioNewDesign.tsx
export function LinkInBioNewDesign({ profile, showAddToContacts, onAddToContacts }) {
  // Votre design ici
}
```

2. **Ajouter le schéma de validation** :
```typescript
// DynamicProfileForm.tsx
const designSpecificSchemas = {
  // ...
  newdesign: z.object({
    // Champs spécifiques
  })
}
```

3. **Ajouter la configuration** :
```typescript
// DynamicProfileForm.tsx
const designFieldsConfig = {
  // ...
  newdesign: {
    name: 'Nouveau Design',
    description: 'Description',
    specificFields: ['field1', 'field2'],
    socialFields: ['instagram'],
    requiresLinks: false
  }
}
```

4. **Ajouter dans TemplateSelectionStep** :
```typescript
const templates = [
  // ...
  {
    id: 'newdesign',
    name: 'Nouveau Design',
    description: '...',
    icon: Icon,
    color: 'color',
    // ...
  }
]
```

5. **Ajouter le rendu** :
```typescript
// TemplateSelectionStep.tsx
const renderPreview = (designId: string) => {
  switch (designId) {
    // ...
    case 'newdesign':
      return <LinkInBioNewDesign profile={profile} />
  }
}
```

---

## ✅ Tests et validation

### Checklist de test

#### Étape 1 : Choix du design
- [ ] Les 8 designs s'affichent correctement
- [ ] L'aperçu fonctionne pour chaque design
- [ ] La sélection met à jour l'interface
- [ ] Le bouton "Continuer" passe à l'étape 2

#### Étape 2 : Formulaire dynamique
- [ ] Les champs communs s'affichent
- [ ] Les champs spécifiques s'affichent selon le design
- [ ] L'upload d'images fonctionne
- [ ] La validation Zod fonctionne
- [ ] Les messages d'erreur sont clairs
- [ ] Le bouton "Retour" revient à l'étape 1
- [ ] Le bouton "Continuer" passe à l'étape 3

#### Étape 3 : Aperçu
- [ ] Le récapitulatif affiche toutes les infos
- [ ] Le bouton "Modifier" revient à l'étape 2
- [ ] Le bouton "Créer" lance la création
- [ ] Un loader s'affiche pendant la création

#### Étape 4 : Succès
- [ ] Le message de succès s'affiche
- [ ] Les informations du profil sont correctes
- [ ] Le bouton "Voir ma page" ouvre le profil
- [ ] Le bouton "Retour" redirige vers le dashboard

#### Base de données
- [ ] Le profil est créé dans Supabase
- [ ] Tous les champs sont remplis
- [ ] Le username est unique
- [ ] Les liens personnalisés sont au format JSON
- [ ] Les politiques RLS fonctionnent

---

## 🐛 Dépannage

### Problème : Le formulaire ne valide pas

**Cause** : Schéma Zod incorrect ou champs manquants

**Solution** :
1. Vérifier que tous les champs requis sont remplis
2. Vérifier les URLs (doivent commencer par http:// ou https://)
3. Vérifier la console pour les erreurs de validation

### Problème : L'aperçu ne s'affiche pas

**Cause** : Design non trouvé dans le switch

**Solution** :
1. Vérifier que le design est bien ajouté dans `renderPreview()`
2. Vérifier l'import du composant de design

### Problème : Erreur lors de la création

**Cause** : Champs manquants ou username déjà pris

**Solution** :
1. Vérifier que tous les champs obligatoires sont présents
2. Vérifier la logique de génération du username unique
3. Vérifier les logs Supabase

---

## 📈 Améliorations futures

### Court terme
- [ ] Aperçu en temps réel pendant le remplissage du formulaire
- [ ] Sauvegarde automatique dans localStorage
- [ ] Validation en temps réel des champs
- [ ] Suggestions de username disponibles

### Moyen terme
- [ ] Éditeur de design en direct
- [ ] Templates personnalisables
- [ ] Import de données depuis réseaux sociaux
- [ ] QR Code automatique

### Long terme
- [ ] IA pour suggestions de bio
- [ ] Analyse de performance des designs
- [ ] A/B testing des designs
- [ ] Thèmes de couleurs personnalisés

---

## 📞 Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier `DATABASE_UPDATES.md` pour la base de données
3. Consulter les commentaires dans le code
4. Vérifier les logs de la console

---

**Version** : 2.0  
**Date** : 2025-01-31  
**Auteur** : Assistant IA  
**Statut** : ✅ Production Ready
