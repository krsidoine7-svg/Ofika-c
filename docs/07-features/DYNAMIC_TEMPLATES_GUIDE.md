# Guide: Système de Templates Dynamiques - Onboarding & Édition

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Flux utilisateur](#flux-utilisateur)
4. [Structure de base de données](#structure-de-base-de-données)
5. [API Routes](#api-routes)
6. [Composants frontend](#composants-frontend)
7. [Guide d'utilisation](#guide-dutilisation)
8. [Tests](#tests)
9. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

Le système de templates dynamiques permet de créer des profils avec:
- **Champs universels (base)**: Nom, bio, email, réseaux sociaux, etc. → Toujours demandés
- **Champs spécifiques au template**: Définis dynamiquement selon le template choisi
- **Support OAuth**: Import automatique de métriques sociales (followers, etc.)
- **Validation schema-based**: Validation côté client et serveur avec Zod

### Objectifs

✅ Séparer clairement les champs universels des champs template-specific  
✅ Permettre l'ajout de nouveaux templates sans modification de code  
✅ Valider les données avec des schémas JSON versionnés  
✅ Supporter l'import OAuth pour métriques sociales  
✅ Faciliter l'édition séparée des deux types de champs  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
├─────────────────────────────────────────────────────────────┤
│  Step 1: BaseForm          → Champs universels             │
│  Step 2: TemplateSelect    → Choix du template parmi 8     │
│  Step 3: TemplateForm      → Champs spécifiques au template│
│  Step 4: Success           → Profil créé!                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EDITION FLOW                             │
├─────────────────────────────────────────────────────────────┤
│  Tab 1: Base Fields        → Modifier champs universels    │
│  Tab 2: Template Fields    → Modifier champs du template   │
└─────────────────────────────────────────────────────────────┘
```

### Structure des données

```typescript
Profile {
  // Champs de base (universels) → table profiles
  id, user_id, name, bio, email, phone, 
  custom_url, image_url, whatsapp, facebook, 
  instagram, twitter, youtube, tiktok, website,
  is_public, design_choice, created_at, updated_at
}

ProfileTemplateData {
  // Champs spécifiques au template → table profile_template_data
  id, profile_id, template_id,
  fields: JSON { [fieldName]: value },
  metadata: JSON,
  created_at, updated_at
}

TemplateSchema {
  // Définition du template → table template_schemas
  id, name, slug, description, 
  schema: JSON { fields: [...] },
  version, is_active, category, features, stats
}
```

---

## 🔄 Flux utilisateur

### Création de profil (Onboarding)

1. **BaseForm** (`/dashboard/profiles/create-v2`)
   - L'utilisateur remplit les champs universels
   - Validation immédiate avec Zod
   - Vérification de disponibilité de l'URL personnalisée
   
2. **TemplateSelect**
   - Affichage des 8 templates avec aperçu en temps réel
   - Sélection d'un template
   - Analytics: `template_selected`
   
3. **TemplateForm**
   - Affichage dynamique des champs selon le schema JSON du template
   - Support des types: text, textarea, number, boolean, url, email, select
   - Boutons d'import OAuth si `import_source` défini
   - Validation selon le schema
   
4. **API Call** `POST /api/profiles`
   ```json
   {
     "baseFields": { "name": "...", "custom_url": "...", ... },
     "templateId": "uuid",
     "templateFields": { "instagram_followers": 1000, ... }
   }
   ```
   
5. **Success**
   - Profil créé dans `profiles`
   - Données template dans `profile_template_data`
   - Analytics: `profile_created`
   - Redirection vers le profil ou dashboard

### Édition de profil

1. **Load Profile** (`/dashboard/profiles/[id]/edit-v2`)
   - Récupération du profil + template + template_data
   
2. **Tab "Informations de base"**
   - Formulaire pré-rempli avec BaseProfileForm
   - Modification et sauvegarde indépendante
   
3. **Tab "Champs spécifiques"**
   - Formulaire dynamique selon le template actuel
   - Modification et sauvegarde indépendante

---

## 💾 Structure de base de données

### Tables créées

#### `template_schemas`
Stocke les définitions de templates.

```sql
CREATE TABLE template_schemas (
  id TEXT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,           -- Structure JSON des champs
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50),
  icon VARCHAR(50),
  priority_label VARCHAR(50),
  target_audience TEXT,
  features TEXT[],
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Exemple de schema JSON:**
```json
{
  "fields": [
    {
      "name": "instagram_followers",
      "type": "number",
      "label": "Followers Instagram",
      "placeholder": "Nombre de followers",
      "required": false,
      "min": 0,
      "import_source": "instagram_oauth"
    },
    {
      "name": "content_category",
      "type": "select",
      "label": "Catégorie de contenu",
      "options": ["Lifestyle", "Mode", "Tech", "Gaming"],
      "required": false
    }
  ]
}
```

#### `profile_template_data`
Stocke les valeurs des champs spécifiques pour chaque profil.

```sql
CREATE TABLE profile_template_data (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES template_schemas(id) ON DELETE RESTRICT,
  fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);
```

### Migrations

Exécuter dans l'ordre:

```bash
# 1. Créer les tables
psql -f supabase/migrations/20250105_dynamic_templates_schema.sql

# 2. Seeder les 8 templates initiaux
psql -f supabase/migrations/20250105_seed_template_schemas.sql
```

**Templates seedés:**
1. Design Classique (Professionnel)
2. Design Moderne (Créatifs)
3. Design Créatif (Premium)
4. Design Nature (Minimaliste)
5. Design Influenceur
6. Design E-commerce
7. Design Dark Elegant
8. Design Freelance

---

## 🔌 API Routes

### `GET /api/templates`

Récupère tous les templates actifs.

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Design Influenceur",
      "slug": "influencer",
      "schema": {
        "fields": [...]
      },
      "category": "influencer",
      "features": [...],
      "stats": {...}
    }
  ],
  "count": 8
}
```

### `POST /api/profiles`

Crée un profil avec baseFields + templateFields.

**Request:**
```json
{
  "baseFields": {
    "name": "Jean Dupont",
    "bio": "...",
    "email": "jean@exemple.com",
    "custom_url": "jean-dupont",
    "instagram": "@jeandupont",
    "is_public": true
  },
  "templateId": "uuid-du-template",
  "templateFields": {
    "instagram_followers": 5000,
    "content_category": "Lifestyle",
    "collaboration_email": "collab@jean.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "name": "Jean Dupont",
    "custom_url": "jean-dupont",
    "design_choice": "influencer",
    "template": {...},
    "template_fields": {...}
  }
}
```

**Validation:**
- ✅ baseFields validé avec `baseProfileSchema` (Zod)
- ✅ templateFields validé dynamiquement selon le schema du template
- ✅ custom_url vérifié pour unicité et mots réservés
- ✅ username généré automatiquement si besoin

---

## 🎨 Composants frontend

### Arborescence

```
components/features/profiles/
├── BaseProfileForm.tsx           → Formulaire universel
├── DynamicTemplateForm.tsx       → Formulaire dynamique template
├── TemplateSelectionStep.tsx     → Sélection de template
├── TemplateFieldsStep.tsx        → Étape champs spécifiques
└── ProfileForm.tsx               → Ancien formulaire (legacy)

app/dashboard/profiles/
├── create-v2/page.tsx            → Nouveau flow onboarding
├── [id]/edit-v2/page.tsx         → Nouveau flow édition
└── create/page.tsx               → Ancien flow (legacy)

lib/
├── types/template.ts             → Types TypeScript
├── validation/profile-schemas.ts → Schémas Zod
└── hooks/useTemplates.ts         → Hook React
```

### Utilisation des composants

#### BaseProfileForm

```tsx
<BaseProfileForm
  initialValues={{}}
  onSubmit={(data) => console.log(data)}
  loading={false}
  submitLabel="Continuer"
/>
```

#### DynamicTemplateForm

```tsx
<DynamicTemplateForm
  template={template}
  initialValues={{}}
  onSubmit={(data) => console.log(data)}
  loading={false}
  submitLabel="Enregistrer"
/>
```

---

## 📖 Guide d'utilisation

### Ajouter un nouveau template

1. **Insérer dans la DB** (via Supabase Studio ou SQL):

```sql
INSERT INTO template_schemas (name, slug, description, category, schema)
VALUES (
  'Mon Template',
  'mon-template',
  'Description du template',
  'business',
  '{
    "fields": [
      {
        "name": "mon_champ",
        "type": "text",
        "label": "Mon Champ",
        "required": true,
        "max": 100
      }
    ]
  }'::jsonb
);
```

2. **Créer le composant de rendu** (optionnel):

```tsx
// components/features/profiles/LinkInBioMonTemplate.tsx
export function LinkInBioMonTemplate({ profile }: { profile: any }) {
  return (
    <div>
      {/* Votre design personnalisé */}
    </div>
  )
}
```

3. **L'ajouter dans TemplateSelectionStep**:

```tsx
case 'mon-template':
  return <LinkInBioMonTemplate profile={profile} ... />
```

### Support d'import OAuth

Pour ajouter un champ avec import OAuth:

```json
{
  "name": "instagram_followers",
  "type": "number",
  "label": "Followers Instagram",
  "import_source": "instagram_oauth",
  "required": false
}
```

Le bouton "Importer" apparaîtra automatiquement. À implémenter:
- Configuration OAuth provider (Instagram, TikTok, etc.)
- Popup d'authentification
- Récupération des données via API
- Mise à jour du champ automatiquement

---

## 🧪 Tests

### Tests unitaires

```bash
npm run test
```

Fichiers:
- `tests/api/templates.test.ts` - Tests API
- `tests/components/DynamicTemplateForm.test.tsx` - Tests composant (à créer)

### Tests manuels

#### Checklist création de profil

- [ ] Formulaire de base: validation en temps réel
- [ ] URL personnalisée: vérification disponibilité
- [ ] Sélection template: aperçu fonctionne
- [ ] Champs template: affichage dynamique correct
- [ ] Types de champs: text, number, select, boolean, url, email
- [ ] Validation: messages d'erreur clairs
- [ ] Création: profil créé dans les 2 tables
- [ ] Redirection: vers le profil ou dashboard

#### Checklist édition de profil

- [ ] Chargement: données pré-remplies
- [ ] Tab Base: modification et save
- [ ] Tab Template: modification et save
- [ ] Validation: erreurs affichées
- [ ] Persistance: changements sauvegardés

---

## 🚀 Déploiement

### Prérequis

1. **Database migrations exécutées**:
```bash
supabase migration up
```

2. **Seed des templates**:
```bash
psql -f supabase/migrations/20250105_seed_template_schemas.sql
```

3. **Variables d'environnement** (.env):
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Build

```bash
npm run build
npm run start
```

### Vercel

Le projet se déploie automatiquement sur Vercel:
- Main branch → Production
- Feature branches → Preview

---

## 📊 Analytics Events

Le système track les événements suivants:

```typescript
// Onboarding
'onboarding_started'
'onboarding_base_form_completed' { has_image, has_bio }
'template_selected' { template_name, template_id, template_category }
'template_form_completed' { template_name, field_count, filled_fields }
'profile_created' { template_name, has_template_fields, total_fields }

// Édition
'profile_edit_started' { template_name }
'profile_edit_base_updated' { fields_changed }
'profile_edit_template_updated' { template_name, fields_changed }

// OAuth
'social_import_initiated' { platform }
'social_import_completed' { platform, imported_fields }
'social_import_failed' { platform, error }
```

---

## 🔧 Troubleshooting

### Erreur: "Template non trouvé"

Vérifier que le template existe et est actif:
```sql
SELECT * FROM template_schemas WHERE is_active = true;
```

### Erreur: "Validation failed"

Vérifier le schema JSON du template:
```sql
SELECT schema FROM template_schemas WHERE slug = 'mon-template';
```

La fonction `validate_template_schema()` valide automatiquement.

### Champs template non affichés

Vérifier que `profile_template_data` existe:
```sql
SELECT * FROM profile_template_data WHERE profile_id = 'uuid';
```

---

## 📝 TODO / Améliorations futures

- [ ] Implémenter réellement l'OAuth pour imports sociaux
- [ ] Ajouter support drag-and-drop pour ordre des champs
- [ ] Système de versioning des templates (migration auto)
- [ ] Preview en temps réel pendant la création
- [ ] Auto-save draft toutes les X secondes
- [ ] Historique des modifications
- [ ] Import/Export de profils
- [ ] Template marketplace (admin)

---

## 📚 Ressources

- [Documentation Zod](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Auteur**: Équipe Ofika  
**Date**: Janvier 2025  
**Version**: 1.0.0
