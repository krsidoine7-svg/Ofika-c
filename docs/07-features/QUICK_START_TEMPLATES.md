# Quick Start: Nouveau système de templates dynamiques

## 🚀 Démarrage rapide (5 minutes)

### 1. Exécuter les migrations

```bash
# Se connecter à Supabase
supabase login

# Appliquer les migrations
supabase db push

# OU manuellement via Supabase Studio → SQL Editor
# Copier-coller le contenu de:
# - supabase/migrations/20250105_dynamic_templates_schema.sql
# - supabase/migrations/20250105_seed_template_schemas.sql
```

### 2. Vérifier que les templates sont présents

```sql
-- Via Supabase Studio ou psql
SELECT name, slug, is_active FROM template_schemas;

-- Devrait retourner 8 templates actifs
```

### 3. Tester l'API templates

```bash
# Ouvrir dans le navigateur
http://localhost:3000/api/templates

# Devrait retourner:
{
  "templates": [...],
  "count": 8
}
```

### 4. Créer votre premier profil (nouveau flow)

1. Aller sur: `http://localhost:3000/dashboard/profiles/create-v2`
2. Remplir le formulaire de base (Step 1)
3. Choisir un template (Step 2)
4. Remplir les champs spécifiques si présents (Step 3)
5. Confirmer (Step 4)

Votre profil est créé avec:
- ✅ Données de base dans `profiles`
- ✅ Données template dans `profile_template_data`

---

## 📖 Utilisation

### Créer un profil via l'UI

**Nouveau flux (recommandé):**
```
/dashboard/profiles/create-v2
```

**Ancien flux (legacy):**
```
/dashboard/profiles/create
```

### Éditer un profil

**Nouveau flux (recommandé):**
```
/dashboard/profiles/[id]/edit-v2
```

Deux onglets:
- Informations de base → Modifier les champs universels
- Champs spécifiques → Modifier les champs du template

**Ancien flux (legacy):**
```
/dashboard/profiles/[id]/edit
```

---

## 🧪 Tester l'API avec cURL

### Récupérer les templates

```bash
curl http://localhost:3000/api/templates
```

### Créer un profil (nécessite authentification)

```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "baseFields": {
      "name": "Test User",
      "custom_url": "test-user",
      "bio": "Test bio",
      "email": "test@example.com",
      "is_public": true
    },
    "templateId": "TEMPLATE_UUID_FROM_DB",
    "templateFields": {
      "company": "Test Corp",
      "position": "Developer"
    }
  }'
```

### Obtenir un token Supabase

```javascript
// Dans la console du navigateur sur votre site
const { data } = await supabase.auth.getSession()
console.log(data.session.access_token)
```

---

## 🧩 Utiliser les composants dans votre code

### BaseProfileForm

```tsx
import { BaseProfileForm } from '@/components/features/profiles/BaseProfileForm'

function MyComponent() {
  const handleSubmit = (data) => {
    console.log('Base fields:', data)
  }
  
  return (
    <BaseProfileForm
      onSubmit={handleSubmit}
      submitLabel="Continuer"
    />
  )
}
```

### DynamicTemplateForm

```tsx
import { DynamicTemplateForm } from '@/components/features/profiles/DynamicTemplateForm'
import { useTemplate } from '@/lib/hooks/useTemplates'

function MyComponent() {
  const { template } = useTemplate('influencer')
  
  if (!template) return <div>Loading...</div>
  
  return (
    <DynamicTemplateForm
      template={template}
      onSubmit={(data) => console.log('Template fields:', data)}
      submitLabel="Enregistrer"
    />
  )
}
```

### Hook useTemplates

```tsx
import { useTemplates } from '@/lib/hooks/useTemplates'

function MyComponent() {
  const { templates, loading, error } = useTemplates()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <ul>
      {templates.map(t => (
        <li key={t.id}>{t.name}</li>
      ))}
    </ul>
  )
}
```

---

## 📝 Ajouter un nouveau template

### Option 1: Via Supabase Studio

1. Aller dans `template_schemas` table
2. Cliquer "Insert row"
3. Remplir:
   - `name`: "Mon Template"
   - `slug`: "mon-template"
   - `description`: "Description"
   - `schema`: (Voir structure ci-dessous)
   - `is_active`: `true`

### Option 2: Via SQL

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
        "name": "mon_champ_1",
        "type": "text",
        "label": "Mon Champ 1",
        "placeholder": "Entrez une valeur",
        "required": true,
        "max": 100
      },
      {
        "name": "mon_champ_2",
        "type": "number",
        "label": "Mon Champ 2",
        "min": 0,
        "max": 1000000,
        "required": false
      }
    ]
  }'::jsonb
);
```

### Structure du schema JSON

```json
{
  "fields": [
    {
      "name": "nom_du_champ",           // Clé dans les données
      "type": "text|textarea|number|boolean|url|email|select",
      "label": "Label affiché",
      "placeholder": "Texte d'aide",
      "required": true|false,
      
      // Pour text/textarea
      "max": 100,                       // Longueur max
      "validation": "^[A-Z]+$",        // Regex (optionnel)
      
      // Pour number
      "min": 0,
      "max": 1000,
      
      // Pour select
      "options": ["Option 1", "Option 2"],
      
      // Pour import OAuth
      "import_source": "instagram_oauth|tiktok_oauth|youtube_oauth",
      
      // Aide contextuelle
      "helpText": "Texte d'aide affiché sous le champ"
    }
  ]
}
```

---

## 🔍 Debugging

### Les templates ne s'affichent pas

```sql
-- Vérifier que les templates sont actifs
SELECT * FROM template_schemas WHERE is_active = true;

-- Si vide, re-run le seed
\i supabase/migrations/20250105_seed_template_schemas.sql
```

### Erreur "Template non trouvé"

Vérifier que le `templateId` existe:

```sql
SELECT id, name FROM template_schemas WHERE id = 'VOTRE_ID';
```

### Les champs template ne s'affichent pas

Vérifier le schema JSON:

```sql
SELECT schema FROM template_schemas WHERE slug = 'mon-template';

-- Devrait retourner un JSON avec "fields": [...]
```

### Erreur de validation

Activer les logs détaillés dans la console:

```typescript
// Dans votre composant
console.log('Template:', template)
console.log('Schema fields:', template.schema.fields)
console.log('Form data:', formData)
```

---

## 📚 Documentation complète

- **Guide complet**: `DYNAMIC_TEMPLATES_GUIDE.md`
- **Résumé d'implémentation**: `IMPLEMENTATION_SUMMARY.md`
- **Collection Postman**: `postman/dynamic-templates.json`

---

## ✅ Checklist de vérification

- [ ] Migrations exécutées
- [ ] 8 templates présents en DB
- [ ] API `/api/templates` retourne les templates
- [ ] Création de profil fonctionne (create-v2)
- [ ] Édition de profil fonctionne (edit-v2)
- [ ] Validation des champs fonctionne
- [ ] Les champs template-specific s'affichent

---

**Questions?** Consultez `DYNAMIC_TEMPLATES_GUIDE.md` ou le code source.
