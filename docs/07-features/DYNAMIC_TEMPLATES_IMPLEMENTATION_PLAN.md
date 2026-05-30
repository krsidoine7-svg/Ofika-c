# 🎯 Plan d'Implémentation - Système de Templates Dynamiques

## 📊 Analyse de l'Architecture Actuelle

### Structure Existante
- **Base de données**: Table `profiles` avec colonnes fixes pour tous les champs sociaux
- **Onboarding**: 2 étapes (Form → Template Selection)
- **Templates**: 8 templates définis en dur dans `TemplateSelectionStep.tsx`
- **Problème**: Les champs spécifiques aux templates ne sont pas clairement séparés des champs universels

### Exemples de Champs par Template
- **Influencer**: Instagram followers, TikTok followers, YouTube subscribers
- **E-commerce**: Store URL, catalog links, payment methods
- **Freelance**: Portfolio URL, hourly rate, services offered
- **Professional**: Company, position, LinkedIn

---

## 🎯 Architecture Cible

### Structure de Données

```
profiles (table existante - champs universels)
├── id, user_id
├── name, bio, image_url
├── custom_url, username
├── email, phone
├── is_public, is_active
└── design_choice (référence au template)

template_schemas (nouvelle table)
├── id, name, slug
├── schema (JSONB - définition des champs)
├── version
└── is_active

profile_template_data (nouvelle table)
├── id, profile_id
├── template_id
├── fields (JSONB - données spécifiques au template)
└── created_at, updated_at
```

### Schema JSON des Templates

```json
{
  "influencer": {
    "fields": [
      {
        "name": "instagram_handle",
        "type": "text",
        "label": "Instagram",
        "required": false,
        "validation": "^@?[a-zA-Z0-9._]+$"
      },
      {
        "name": "instagram_followers",
        "type": "number",
        "label": "Followers Instagram",
        "required": false,
        "import_source": "instagram_oauth"
      },
      {
        "name": "tiktok_handle",
        "type": "text",
        "label": "TikTok",
        "required": false
      },
      {
        "name": "youtube_channel",
        "type": "url",
        "label": "Chaîne YouTube",
        "required": false
      }
    ]
  }
}
```

---

## 📦 Commits Logiques

### Phase 1: Database Schema (Commit 1-2)

#### Commit 1: `feat(db): add template_schemas and profile_template_data tables`
```sql
-- Fichier: supabase/migrations/20250105_dynamic_templates_schema.sql
CREATE TABLE template_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_template_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES template_schemas(id),
  fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);
```

#### Commit 2: `feat(db): seed template schemas with initial 8 templates`
```sql
-- Fichier: supabase/migrations/20250105_seed_template_schemas.sql
INSERT INTO template_schemas (name, slug, schema) VALUES
('Design Classique', 'design1', '{
  "fields": []
}'::jsonb),
('Design Influenceur', 'influencer', '{
  "fields": [
    {"name": "instagram_followers", "type": "number", "label": "Followers Instagram"},
    {"name": "youtube_subscribers", "type": "number", "label": "Abonnés YouTube"}
  ]
}'::jsonb);
-- ... etc pour les 8 templates
```

---

### Phase 2: Types & Validation (Commit 3-4)

#### Commit 3: `feat(types): add template schema types and validators`
```typescript
// Fichier: lib/types/template.ts
export interface TemplateField {
  name: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'url' | 'email' | 'social_account'
  label: string
  required?: boolean
  validation?: string
  placeholder?: string
  import_source?: 'instagram_oauth' | 'tiktok_oauth' | 'youtube_oauth'
  min?: number
  max?: number
  options?: string[]
}

export interface TemplateSchema {
  id: string
  name: string
  slug: string
  description?: string
  schema: {
    fields: TemplateField[]
  }
  version: number
  is_active: boolean
}

export interface ProfileTemplateData {
  id: string
  profile_id: string
  template_id: string
  fields: Record<string, any>
}
```

#### Commit 4: `feat(validation): add zod schemas for base and template fields`
```typescript
// Fichier: lib/validation/profile-schemas.ts
import { z } from 'zod'

export const baseProfileSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(100),
  bio: z.string().max(500).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  custom_url: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  is_public: z.boolean().default(true)
})

export const createDynamicTemplateSchema = (fields: TemplateField[]) => {
  const shape: Record<string, z.ZodTypeAny> = {}
  
  fields.forEach(field => {
    let validator: z.ZodTypeAny
    
    switch (field.type) {
      case 'number':
        validator = z.number().or(z.string().transform(Number))
        if (field.min !== undefined) validator = validator.min(field.min)
        if (field.max !== undefined) validator = validator.max(field.max)
        break
      case 'url':
        validator = z.string().url()
        break
      case 'email':
        validator = z.string().email()
        break
      default:
        validator = z.string()
        if (field.validation) {
          validator = validator.regex(new RegExp(field.validation))
        }
    }
    
    if (!field.required) {
      validator = validator.optional()
    }
    
    shape[field.name] = validator
  })
  
  return z.object(shape)
}
```

---

### Phase 3: API Routes (Commit 5-7)

#### Commit 5: `feat(api): add GET /api/templates endpoint`
```typescript
// Fichier: app/api/templates/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('template_schemas')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ templates: data })
}
```

#### Commit 6: `feat(api): add POST /api/profiles with template data support`
```typescript
// Fichier: app/api/profiles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { baseProfileSchema } from '@/lib/validation/profile-schemas'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { baseFields, templateId, templateFields } = body
  
  // Valider les champs de base
  const validatedBase = baseProfileSchema.parse(baseFields)
  
  // Créer le profil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      ...validatedBase,
      design_choice: templateId
    })
    .select()
    .single()
  
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }
  
  // Sauvegarder les données spécifiques au template
  if (templateFields && Object.keys(templateFields).length > 0) {
    const { error: templateError } = await supabase
      .from('profile_template_data')
      .insert({
        profile_id: profile.id,
        template_id: templateId,
        fields: templateFields
      })
    
    if (templateError) {
      console.error('Error saving template data:', templateError)
    }
  }
  
  return NextResponse.json({ profile })
}
```

#### Commit 7: `feat(api): add PUT /api/profiles/[id] with template merge`
```typescript
// Fichier: app/api/profiles/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Similaire à POST mais avec UPDATE
  // Fusionner baseFields + templateFields
}
```

---

### Phase 4: Components (Commit 8-11)

#### Commit 8: `feat(components): create DynamicFormField component`
```typescript
// Fichier: components/features/profiles/DynamicFormField.tsx
import { TemplateField } from '@/lib/types/template'
import { Input } from '@/components/core/ui/input'
import { Textarea } from '@/components/core/ui/textarea'
import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface DynamicFormFieldProps {
  field: TemplateField
  register: UseFormRegister<any>
  errors: FieldErrors
}

export function DynamicFormField({ field, register, errors }: DynamicFormFieldProps) {
  const error = errors[field.name]
  
  switch (field.type) {
    case 'textarea':
      return (
        <div>
          <label>{field.label}</label>
          <Textarea {...register(field.name)} placeholder={field.placeholder} />
          {error && <span className="text-red-500">{error.message}</span>}
        </div>
      )
    
    case 'number':
      return (
        <div>
          <label>{field.label}</label>
          <Input 
            type="number" 
            {...register(field.name, { valueAsNumber: true })} 
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
          />
          {error && <span className="text-red-500">{error.message}</span>}
        </div>
      )
    
    case 'social_account':
      return (
        <div>
          <label>{field.label}</label>
          <div className="flex gap-2">
            <Input {...register(field.name)} placeholder={field.placeholder} />
            {field.import_source && (
              <Button type="button" onClick={() => handleSocialImport(field.import_source)}>
                Connecter
              </Button>
            )}
          </div>
          {error && <span className="text-red-500">{error.message}</span>}
        </div>
      )
    
    default:
      return (
        <div>
          <label>{field.label}</label>
          <Input {...register(field.name)} placeholder={field.placeholder} />
          {error && <span className="text-red-500">{error.message}</span>}
        </div>
      )
  }
}
```

#### Commit 9: `feat(components): create TemplateSpecificForm component`
```typescript
// Fichier: components/features/profiles/TemplateSpecificForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TemplateSchema } from '@/lib/types/template'
import { createDynamicTemplateSchema } from '@/lib/validation/profile-schemas'
import { DynamicFormField } from './DynamicFormField'

interface TemplateSpecificFormProps {
  template: TemplateSchema
  onSubmit: (data: Record<string, any>) => void
  initialData?: Record<string, any>
}

export function TemplateSpecificForm({ 
  template, 
  onSubmit, 
  initialData 
}: TemplateSpecificFormProps) {
  const schema = createDynamicTemplateSchema(template.schema.fields)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>Champs spécifiques: {template.name}</h3>
      
      {template.schema.fields.map(field => (
        <DynamicFormField 
          key={field.name}
          field={field}
          register={register}
          errors={errors}
        />
      ))}
      
      <Button type="submit">Sauvegarder</Button>
    </form>
  )
}
```

#### Commit 10: `refactor(onboarding): split into 3 steps with template form`
```typescript
// Fichier: app/onboarding/profile/page.tsx
type OnboardingStep = 'base' | 'template-select' | 'template-form' | 'success'

export default function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>('base')
  const [baseData, setBaseData] = useState({})
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSchema>()
  const [templateData, setTemplateData] = useState({})
  
  const handleBaseFormSubmit = (data: any) => {
    setBaseData(data)
    setStep('template-select')
  }
  
  const handleTemplateSelect = (template: TemplateSchema) => {
    setSelectedTemplate(template)
    if (template.schema.fields.length > 0) {
      setStep('template-form')
    } else {
      // Pas de champs spécifiques, créer directement
      createProfile()
    }
  }
  
  const handleTemplateFormSubmit = async (data: any) => {
    setTemplateData(data)
    await createProfile()
  }
  
  const createProfile = async () => {
    const response = await fetch('/api/profiles', {
      method: 'POST',
      body: JSON.stringify({
        baseFields: baseData,
        templateId: selectedTemplate?.id,
        templateFields: templateData
      })
    })
    // ...
  }
  
  return (
    <div>
      {step === 'base' && <BaseProfileForm onSubmit={handleBaseFormSubmit} />}
      {step === 'template-select' && <TemplateSelection onSelect={handleTemplateSelect} />}
      {step === 'template-form' && selectedTemplate && (
        <TemplateSpecificForm 
          template={selectedTemplate}
          onSubmit={handleTemplateFormSubmit}
        />
      )}
      {step === 'success' && <SuccessMessage />}
    </div>
  )
}
```

#### Commit 11: `feat(profile-edit): add template-specific fields editor`
```typescript
// Fichier: app/dashboard/profiles/[id]/edit/page.tsx
export default function ProfileEditPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>()
  const [templateData, setTemplateData] = useState<any>()
  const [template, setTemplate] = useState<TemplateSchema>()
  
  useEffect(() => {
    loadProfile()
  }, [])
  
  const loadProfile = async () => {
    // Charger profile + template + template_data
    const { data: prof } = await supabase
      .from('profiles')
      .select(`
        *,
        template:template_schemas(*)
      `)
      .eq('id', params.id)
      .single()
    
    const { data: tempData } = await supabase
      .from('profile_template_data')
      .select('fields')
      .eq('profile_id', params.id)
      .single()
    
    setProfile(prof)
    setTemplate(prof.template)
    setTemplateData(tempData?.fields || {})
  }
  
  return (
    <div>
      <h1>Éditer le profil</h1>
      
      {/* Formulaire de base */}
      <section>
        <h2>Informations de base</h2>
        <BaseProfileForm initialData={profile} onSubmit={handleBaseUpdate} />
      </section>
      
      {/* Formulaire template-specific */}
      {template && template.schema.fields.length > 0 && (
        <section>
          <h2>Champs spécifiques: {template.name}</h2>
          <TemplateSpecificForm 
            template={template}
            initialData={templateData}
            onSubmit={handleTemplateUpdate}
          />
        </section>
      )}
    </div>
  )
}
```

---

### Phase 5: OAuth/Social Import (Commit 12-13)

#### Commit 12: `feat(oauth): add Instagram OAuth flow for follower count`
```typescript
// Fichier: app/api/oauth/instagram/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/instagram`,
      code
    })
  })
  
  const { access_token } = await tokenResponse.json()
  
  // Get follower count
  const userResponse = await fetch(`https://graph.instagram.com/me?fields=followers_count&access_token=${access_token}`)
  const { followers_count } = await userResponse.json()
  
  // Store in session/cookie to prefill form
  return NextResponse.redirect(`/onboarding/profile?instagram_followers=${followers_count}`)
}
```

#### Commit 13: `feat(social-import): add connect buttons for templates`
```typescript
// Fichier: lib/hooks/useSocialImport.ts
export function useSocialImport() {
  const handleInstagramConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/instagram`
    const scope = 'user_profile,user_media'
    
    window.location.href = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`
  }
  
  return { handleInstagramConnect }
}
```

---

### Phase 6: Tests (Commit 14-16)

#### Commit 14: `test: add unit tests for dynamic form validation`
```typescript
// Fichier: __tests__/lib/validation/profile-schemas.test.ts
import { describe, it, expect } from '@jest/globals'
import { createDynamicTemplateSchema } from '@/lib/validation/profile-schemas'

describe('Dynamic Template Schema', () => {
  it('should validate required number field', () => {
    const fields = [
      { name: 'followers', type: 'number', label: 'Followers', required: true, min: 0 }
    ]
    const schema = createDynamicTemplateSchema(fields)
    
    expect(() => schema.parse({ followers: -1 })).toThrow()
    expect(() => schema.parse({})).toThrow()
    expect(schema.parse({ followers: 100 })).toEqual({ followers: 100 })
  })
  
  it('should validate optional URL field', () => {
    const fields = [
      { name: 'website', type: 'url', label: 'Website', required: false }
    ]
    const schema = createDynamicTemplateSchema(fields)
    
    expect(() => schema.parse({ website: 'invalid' })).toThrow()
    expect(schema.parse({})).toEqual({})
    expect(schema.parse({ website: 'https://example.com' })).toEqual({ website: 'https://example.com' })
  })
})
```

#### Commit 15: `test: add integration tests for profile API`
```typescript
// Fichier: __tests__/app/api/profiles/route.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createMocks } from 'node-mocks-http'

describe('POST /api/profiles', () => {
  it('should create profile with base + template fields', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        baseFields: {
          name: 'John Doe',
          bio: 'Test bio',
          custom_url: 'johndoe'
        },
        templateId: 'template-id',
        templateFields: {
          instagram_followers: 1000
        }
      }
    })
    
    const response = await POST(req)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.profile.name).toBe('John Doe')
  })
})
```

#### Commit 16: `test: add React Testing Library tests for forms`
```typescript
// Fichier: __tests__/components/TemplateSpecificForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TemplateSpecificForm } from '@/components/features/profiles/TemplateSpecificForm'

describe('TemplateSpecificForm', () => {
  it('should render dynamic fields based on schema', () => {
    const template = {
      id: '1',
      name: 'Influencer',
      schema: {
        fields: [
          { name: 'instagram', type: 'text', label: 'Instagram Handle' },
          { name: 'followers', type: 'number', label: 'Followers' }
        ]
      }
    }
    
    render(<TemplateSpecificForm template={template} onSubmit={jest.fn()} />)
    
    expect(screen.getByLabelText('Instagram Handle')).toBeInTheDocument()
    expect(screen.getByLabelText('Followers')).toBeInTheDocument()
  })
  
  it('should validate and submit form', async () => {
    const onSubmit = jest.fn()
    // ... test
  })
})
```

---

### Phase 7: Documentation & Migration (Commit 17-18)

#### Commit 17: `docs: add template system README`
```markdown
# Fichier: docs/TEMPLATE_SYSTEM.md

## Vue d'ensemble

Le système de templates dynamiques permet de définir des champs spécifiques pour chaque type de profil...

## Ajouter un Nouveau Template

1. Créer le schema JSON
2. Insérer dans template_schemas
3. Créer le composant de rendu

## API Reference

### GET /api/templates
...
```

#### Commit 18: `chore: add migration script and curl examples`
```bash
# Fichier: scripts/migrate-existing-profiles.ts

// Script pour migrer les profils existants vers le nouveau système
async function migrateProfiles() {
  const profiles = await supabase.from('profiles').select('*')
  
  for (const profile of profiles) {
    // Extraire les champs spécifiques selon le design_choice
    const templateFields = extractTemplateFields(profile)
    
    // Créer l'entrée profile_template_data
    await supabase.from('profile_template_data').insert({
      profile_id: profile.id,
      template_id: getTemplateIdForDesign(profile.design_choice),
      fields: templateFields
    })
  }
}
```

```bash
# Fichier: api-examples.http

### Get All Templates
GET {{host}}/api/templates

### Create Profile with Template
POST {{host}}/api/profiles
Content-Type: application/json

{
  "baseFields": {
    "name": "John Doe",
    "bio": "Influencer",
    "custom_url": "johndoe"
  },
  "templateId": "uuid",
  "templateFields": {
    "instagram_followers": 10000,
    "youtube_subscribers": 5000
  }
}
```

---

## 🎯 Ordre d'Exécution des Commits

1. **Database** (1-2) → Structure de base
2. **Types** (3-4) → Typage TypeScript + Validation
3. **API** (5-7) → Backend logic
4. **Components** (8-11) → Frontend UI
5. **OAuth** (12-13) → Social import (optionnel)
6. **Tests** (14-16) → Qualité code
7. **Docs** (17-18) → Documentation

---

## 📊 KPIs & Métriques

### Analytics Events à Tracker
```typescript
// Onboarding
- onboarding_started
- onboarding_base_form_completed
- template_selected { template_name, template_id }
- template_form_completed { template_name, field_count }
- profile_created { template_name, has_template_fields }

// Edition
- profile_edit_started
- profile_edit_base_updated
- profile_edit_template_updated
- social_import_initiated { platform }
- social_import_completed { platform, imported_fields }
```

### Performance Targets
- Onboarding completion time: < 2 minutes
- Template form load: < 500ms
- Profile save: < 1s
- Social OAuth redirect: < 3s

---

## 🔧 Configuration Requise

### Variables d'Environnement
```bash
# OAuth (optionnel)
INSTAGRAM_CLIENT_ID=xxx
INSTAGRAM_CLIENT_SECRET=xxx
TIKTOK_CLIENT_ID=xxx
TIKTOK_CLIENT_SECRET=xxx
YOUTUBE_API_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Dépendances Nouvelles
```json
{
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0",
  "react-hook-form": "^7.48.0"
}
```

---

## ✅ Checklist de Review

- [ ] Tous les commits suivent le format Conventional Commits
- [ ] Tests unitaires passent (> 80% coverage)
- [ ] Tests d'intégration passent
- [ ] Migration SQL testée localement
- [ ] Pas de régression sur les fonctionnalités existantes
- [ ] Documentation à jour
- [ ] Exemples d'API fonctionnels
- [ ] Performance acceptable (< 1s pour save)
- [ ] Validation côté client + serveur
- [ ] Gestion d'erreurs robuste
- [ ] Analytics events implémentés

---

## 🚀 Déploiement

### Stratégie de Rollout
1. **Dev**: Tester tous les commits
2. **Staging**: Migration des données test + validation
3. **Production**: 
   - Déployer la DB migration
   - Déployer le code
   - Migrer les profils existants (script)
   - Monitorer les erreurs
   - Feature flag pour nouveaux users

---

**Auteur**: Cascade AI
**Date**: 2025-11-05
**Branch**: feature/dynamic-onboarding-templates
