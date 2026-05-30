# 🎨 Système de Templates Dynamiques - Guide Complet

## 🎯 Objectif

Permettre la création de profils avec des champs personnalisés selon le template choisi, tout en maintenant des champs universels de base.

---

## 📊 État d'Avancement

**Progression globale**: 50% ✅

### ✅ Phases Complétées

1. **Database Schema** (100%)
   - Tables `template_schemas` et `profile_template_data` créées
   - 8 templates initiaux configurés
   - RLS policies et sécurité en place
   - Fonctions SQL helpers disponibles

2. **Types & Validation** (100%)
   - Types TypeScript complets dans `lib/types/template.ts`
   - Validation Zod dynamique dans `lib/validation/profile-schemas.ts`
   - Support de tous les types de champs

3. **API Routes** (100%)
   - GET /api/templates - Liste templates
   - GET /api/templates/[slug] - Template spécifique
   - POST /api/profiles - Créer profil avec template
   - GET /api/profiles/[id] - Récupérer profil
   - PUT /api/profiles/[id] - Mettre à jour
   - DELETE /api/profiles/[id] - Supprimer

4. **Documentation** (100%)
   - Plan d'implémentation détaillé
   - Documentation API complète
   - Exemples cURL et Postman

### 🔄 Phases Restantes

- **Components** (0%) - Formulaires dynamiques React
- **Onboarding** (0%) - Refonte flux en 3 étapes
- **Profile Edit** (0%) - Édition avec templates
- **OAuth** (0%) - Import métriques sociales (optionnel)
- **Tests** (0%) - Tests unitaires et d'intégration

---

## 📁 Fichiers Créés

### 🗄 Database (2 fichiers)
```
supabase/migrations/
├── 20250105_dynamic_templates_schema.sql   (Tables + RLS + Triggers)
└── 20250105_seed_template_schemas.sql      (8 templates + Functions)
```

### 🔤 Types & Validation (2 fichiers)
```
lib/
├── types/
│   └── template.ts                        (Interfaces TypeScript)
└── validation/
    └── profile-schemas.ts                 (Schémas Zod)
```

### 🚀 API Routes (4 fichiers)
```
app/api/
├── templates/
│   ├── route.ts                           (GET /api/templates)
│   └── [slug]/route.ts                    (GET /api/templates/[slug])
└── profiles/
    ├── route.ts                           (POST /api/profiles)
    └── [id]/route.ts                      (GET/PUT/DELETE /api/profiles/[id])
```

### 📚 Documentation (4 fichiers)
```
docs/
└── API_TEMPLATES_DOCUMENTATION.md         (Doc API complète)

DYNAMIC_TEMPLATES_IMPLEMENTATION_PLAN.md   (Plan complet)
FEATURE_DYNAMIC_TEMPLATES_PR_SUMMARY.md    (Résumé PR)
README_DYNAMIC_TEMPLATES.md                (Ce fichier)
```

**Total**: **13 fichiers créés**

---

## 🚀 Quick Start

### 1. Appliquer les Migrations

#### Option A: Via Supabase Studio

1. Aller sur [Supabase Studio](https://app.supabase.com)
2. Ouvrir votre projet
3. Aller dans **SQL Editor**
4. Créer une nouvelle query
5. Copier/coller le contenu de `supabase/migrations/20250105_dynamic_templates_schema.sql`
6. Exécuter
7. Répéter avec `20250105_seed_template_schemas.sql`

#### Option B: Via CLI

```bash
supabase db push
```

### 2. Vérifier l'Installation

```bash
# Lister les templates
curl http://localhost:3000/api/templates

# Devrait retourner 8 templates
```

### 3. Tester la Création de Profil

```bash
# 1. Récupérer l'ID d'un template
curl http://localhost:3000/api/templates | jq '.templates[0].id'

# 2. Créer un profil (remplacer TEMPLATE_ID)
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "baseFields": {
      "name": "Test User",
      "custom_url": "test-user"
    },
    "templateId": "TEMPLATE_ID",
    "templateFields": {}
  }'
```

---

## 📖 Structure des Templates

### Champs Universels (Base)

Toujours demandés, peu importe le template:

```typescript
{
  name: string           // Requis
  bio?: string
  image_url?: string
  email?: string
  phone?: string
  custom_url: string     // Requis, unique
  is_public: boolean
  
  // Réseaux sociaux de base
  whatsapp?: string
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  tiktok?: string
  website?: string
}
```

### Champs Spécifiques aux Templates

Définis dans le schema JSON de chaque template:

**Exemple: Template Influenceur**
```json
{
  "fields": [
    {
      "name": "instagram_followers",
      "type": "number",
      "label": "Followers Instagram",
      "required": false,
      "min": 0,
      "import_source": "instagram_oauth"
    },
    {
      "name": "content_category",
      "type": "select",
      "label": "Catégorie de contenu",
      "options": ["Lifestyle", "Mode", "Tech", "Gaming", ...]
    }
  ]
}
```

---

## 🎨 Les 8 Templates Disponibles

| Slug | Nom | Catégorie | Champs Spécifiques |
|------|-----|-----------|-------------------|
| `design1` | Design Classique | Professional | company, position, linkedin |
| `design2` | Design Moderne | Creative | portfolio_url, behance, dribbble |
| `design3` | Design Créatif | Creative | art_style, available_for_commissions |
| `design4` | Design Nature | Minimal | *(aucun)* |
| `influencer` | Design Influenceur | Influencer | instagram_followers, tiktok_followers, youtube_subscribers, content_category, collaboration_email |
| `ecommerce` | Design E-commerce | Business | store_url, product_categories, payment_methods, shipping_countries, whatsapp_order |
| `design7` | Design Dark Elegant | Premium | photography_style, photography_website, booking_url |
| `freelance` | Design Freelance | Business | services_offered, hourly_rate, years_experience, clients_count, projects_completed, availability |

---

## 🔧 Utilisation de l'API

### Récupérer un Template

```bash
GET /api/templates/influencer
```

**Response**:
```json
{
  "template": {
    "id": "uuid",
    "name": "Design Influenceur",
    "slug": "influencer",
    "schema": {
      "fields": [
        {
          "name": "instagram_followers",
          "type": "number",
          "label": "Followers Instagram",
          "min": 0
        }
      ]
    }
  }
}
```

### Créer un Profil Influenceur

```bash
POST /api/profiles
Content-Type: application/json

{
  "baseFields": {
    "name": "Sophie Martin",
    "bio": "Influenceuse lifestyle & mode",
    "custom_url": "sophie-martin",
    "instagram": "@sophiemartin"
  },
  "templateId": "influencer-uuid",
  "templateFields": {
    "instagram_followers": 25000,
    "tiktok_followers": 15000,
    "content_category": "Mode",
    "collaboration_email": "collab@sophiemartin.com"
  }
}
```

### Mettre à Jour les Métriques

```bash
PUT /api/profiles/profile-uuid
Content-Type: application/json

{
  "templateFields": {
    "instagram_followers": 30000,
    "tiktok_followers": 20000
  }
}
```

---

## 🏗 Architecture Technique

### Flow de Création de Profil

```
User Input
    ↓
Step 1: Base Form (champs universels)
    ↓
Step 2: Template Selection (choix parmi 8)
    ↓
Step 3: Template Form (champs spécifiques) [conditionnel]
    ↓
POST /api/profiles
    ↓
┌─────────────────────────┐
│ Validation Base Fields  │
│ (baseProfileSchema)     │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Validation Template     │
│ Fields (dynamic schema) │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ INSERT profiles         │
│ (user_id, baseFields,   │
│  design_choice)         │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ INSERT                  │
│ profile_template_data   │
│ (profile_id, fields)    │
└─────────────────────────┘
    ↓
Profile Created ✅
```

### Sécurité

**Row Level Security (RLS)**:
- ✅ Les utilisateurs ne voient que leurs propres profils
- ✅ Tout le monde peut lire les templates actifs
- ✅ Seuls les admins peuvent modifier les templates
- ✅ Les données de template sont liées au profil

**Validation**:
- ✅ Côté serveur (Zod schemas)
- ✅ Validation dynamique basée sur le template
- ✅ URLs personnalisées uniques
- ✅ Protection contre URLs réservées

---

## 📝 Ajouter un Nouveau Template

### 1. Définir le Schema

```sql
INSERT INTO template_schemas (name, slug, description, category, schema)
VALUES (
  'Mon Nouveau Template',
  'mon-template',
  'Description du template',
  'category',
  '{
    "fields": [
      {
        "name": "custom_field",
        "type": "text",
        "label": "Mon Champ",
        "required": false
      }
    ]
  }'::jsonb
);
```

### 2. Créer le Composant de Rendu (À faire)

```tsx
// components/features/profiles/LinkInBioMonTemplate.tsx
export function LinkInBioMonTemplate({ profile }) {
  const templateData = profile.template_data?.fields || {}
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{templateData.custom_field}</p>
    </div>
  )
}
```

### 3. Ajouter au Switch

```tsx
// Dans TemplateSelectionStep.tsx
case 'mon-template':
  return <LinkInBioMonTemplate profile={profile} />
```

---

## 🧪 Tests

### Test des Migrations

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('template_schemas', 'profile_template_data');

-- Compter les templates
SELECT COUNT(*) FROM template_schemas WHERE is_active = true;
-- Devrait retourner 8

-- Tester la validation de schema
SELECT validate_template_schema('{"fields": []}'::jsonb);
-- Devrait retourner true
```

### Test de l'API

```bash
# Test collection complète
newman run postman_collection.json
```

---

## 🐛 Troubleshooting

### Erreur: "Template non trouvé"

**Cause**: Les migrations n'ont pas été appliquées.

**Solution**:
```sql
-- Vérifier les templates
SELECT * FROM template_schemas;

-- Si vide, réexécuter le seed
\i supabase/migrations/20250105_seed_template_schemas.sql
```

### Erreur: "Cette URL est déjà utilisée"

**Cause**: Le `custom_url` existe déjà.

**Solution**: Choisir un autre custom_url ou ajouter un suffixe.

### Erreur: "Validation échouée"

**Cause**: Les champs ne respectent pas le schema.

**Solution**: Vérifier les types et contraintes dans le schema du template.

---

## 📚 Ressources

- **Plan Complet**: `DYNAMIC_TEMPLATES_IMPLEMENTATION_PLAN.md`
- **Documentation API**: `docs/API_TEMPLATES_DOCUMENTATION.md`
- **Résumé PR**: `FEATURE_DYNAMIC_TEMPLATES_PR_SUMMARY.md`
- **Code**:
  - Types: `lib/types/template.ts`
  - Validation: `lib/validation/profile-schemas.ts`
  - API: `app/api/templates/` et `app/api/profiles/`

---

## 🚀 Prochaines Étapes

Pour continuer l'implémentation:

1. **Créer les composants React** (DynamicFormField, TemplateSpecificForm)
2. **Refactorer l'onboarding** en 3 étapes
3. **Implémenter l'édition** de profil
4. **(Optionnel) OAuth** pour import métriques
5. **Écrire les tests**

Voir `DYNAMIC_TEMPLATES_IMPLEMENTATION_PLAN.md` pour les détails.

---

## 💡 Conseils

- **Migration**: Utiliser la fonction `migrate_profile_to_template_system()` pour les profils existants
- **Validation**: Toujours valider côté serveur ET client
- **Performance**: Les index GIN sur JSONB sont déjà créés
- **Extensibilité**: Facile d'ajouter de nouveaux types de champs

---

## 📞 Support

Pour questions:
- Architecture: Voir `DYNAMIC_TEMPLATES_IMPLEMENTATION_PLAN.md`
- API: Voir `docs/API_TEMPLATES_DOCUMENTATION.md`
- Bugs: Créer une issue avec logs

---

**Version**: 1.0.0  
**Date**: 2025-01-05  
**Auteur**: Cascade AI  
**License**: Propriétaire
