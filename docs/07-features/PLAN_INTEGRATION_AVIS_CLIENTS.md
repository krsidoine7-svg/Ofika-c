# 📋 RAPPORT D'ANALYSE & PLAN D'INTÉGRATION
## Module de Collecte d'Avis Clients - OFIKA

---

## 🔍 PHASE 1 : ANALYSE DU CODE EXISTANT

### 1. Architecture & Structure Détectée

#### **Pattern de Routing**
- ✅ **Next.js 14 App Router** (répertoire `/app`)
- Structure moderne avec Server Components et Client Components
- Routes API dans `/app/api/**/route.ts`
- Layouts imbriqués : `/app/layout.tsx` → `/app/dashboard/layout.tsx`

#### **Structure des Composants**
```
components/
├── core/              # Composants de base (UI, Auth, Layout, Navigation)
│   ├── auth/         # LoginForm, SignupForm, LogoutButton, ProtectedRoute
│   ├── ui/           # 39 composants shadcn/ui
│   ├── layout/       # Composants de mise en page
│   └── navigation/   # Navigation
├── features/          # Composants métier (60 fichiers)
│   ├── profiles/     # Gestion profils
│   ├── card-creator/ # Création de cartes
│   ├── contacts/     # Gestion contacts
│   ├── analytics/    # Analytics
│   ├── nfc-onboarding/
│   ├── links/        # Gestion liens
│   └── ...
├── qr/               # QR Code spécifiques
├── payments/         # Paiements
└── debug/            # Outils debug
```

**Pattern identifié** : **Feature-based architecture** avec séparation `core/` et `features/`

#### **Gestion d'État**
- ✅ **React Query (@tanstack/react-query)** pour data fetching et cache
- ✅ **Context API** pour l'authentification (`AuthContext`)
- ✅ **Custom Hooks** dans `/lib/hooks/`
  - `useAuth()` : authentification
  - `useProfiles()` : gestion profils
  - Et 21 autres hooks personnalisés

#### **Styling**
- ✅ **Tailwind CSS** avec configuration personnalisée
- Couleurs brand : `ofika-orange: #f97316`, `ofika-pink: #ec4899`
- Design tokens via CSS variables (HSL)
- Police principale : **Inter** (`font-inter`)

---

### 2. Base de Données & Backend

#### **Supabase - Schéma Existant**
Tables principales identifiées :
```sql
users (id, email, name, phone, image, subscription_tier, cards_ordered, ...)
profiles (id, user_id, profile_type, name, bio, image_url, username, custom_url, ...)
links (id, profile_id, title, url, description, icon, order_index, ...)
cards (id, user_id, profile_id, nfc_id, qr_code, ...)
orders (id, user_id, order_number, status, quantity, total_amount, shipping_address, ...)
analytics_events (id, profile_id, event_type, event_data, ip_address, user_agent, ...)
dashboard_widgets (id, user_id, widget_type, config, ...)
contact_analytics (pour le tracking des interactions)
notifications (système de notifications)
```

**Convention de nommage** :
- Tables : `snake_case`
- Colonnes : `snake_case`
- UUID comme clé primaire : `gen_random_uuid()`
- Timestamps : `created_at`, `updated_at` (TIMESTAMPTZ)
- Foreign keys : `ON DELETE CASCADE`

#### **Row Level Security (RLS)**
- ✅ RLS activé sur toutes les tables
- Pattern détecté :
  ```sql
  -- Lecture : propriétaire ou public
  FOR SELECT USING (auth.uid() = user_id OR is_public = true)
  
  -- Écriture : propriétaire uniquement
  FOR INSERT/UPDATE/DELETE USING (auth.uid() = user_id)
  
  -- Insertion publique pour analytics
  FOR INSERT WITH CHECK (true)
  ```

#### **Supabase Client Setup**
- Client-side : `@supabase/ssr` → `createBrowserClient()` dans `/lib/supabase/client.ts`
- Server-side : `createServerClient()` avec cookies dans `/lib/supabase/server.ts`
- ⚠️ **Pas de createRouteHandlerClient** → utiliser `createClient()` de `/lib/supabase/server.ts` dans les API routes

#### **Storage Buckets**
Buckets existants :
- `profile-images` (5MB, images uniquement)
- `card-designs` (10MB, images + PDF)

---

### 3. UI/UX & Design System

#### **Bibliothèque de Composants**
- ✅ **shadcn/ui** (Radix UI + Tailwind)
- 39 composants dans `/components/core/ui/`
- Composants utilisés (repérés) :
  - `Button`, `Dialog`, `Input`, `Textarea`, `Select`
  - `Table`, `Tabs`, `Card`, `Badge`, `Alert`
  - `Dropdown Menu`, `Popover`, `Tooltip`
  - `Progress`, `Skeleton`, `Separator`

#### **Système de Notifications**
- ✅ **Sonner** (`sonner` package)
- Configuration dans `/app/layout.tsx` :
  ```tsx
  <Toaster 
    position="top-right" 
    expand={true} 
    richColors={true} 
    closeButton={true} 
  />
  ```
- Utilisation : `import { toast } from 'sonner'`

#### **Design Tokens**
```js
colors: {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  'ofika-orange': '#f97316',
  'ofika-pink': '#ec4899',
  ...
}
fonts: {
  inter: ['var(--font-inter)', 'Inter', 'sans-serif']
}
```

#### **Navigation Pattern**
- Dashboard avec sidebar (desktop) + menu burger (mobile)
- Active link highlighting (orange)
- `/dashboard/*` protégé par `<ProtectedRoute>`

---

### 4. Sécurité & Authentification

#### **Système d'Auth**
- Supabase Auth natif
- Context : `/lib/context/AuthContext.tsx`
- Méthodes exposées :
  ```ts
  user, loading, error
  signIn(email, password)
  signUp(email, password, metadata)
  signOut()
  refreshUser()
  ```

#### **Protection des Routes**
- Component `<ProtectedRoute>` dans `/components/core/auth/ProtectedRoute.tsx`
- Wrap le layout dashboard

#### **Validation**
- ✅ **Zod** pour validation schémas
- Exemple dans `/app/api/orders/create/route.ts` :
  ```ts
  const schema = z.object({
    card_type: z.enum(['nfc_qr', 'qr_only', ...]),
    quantity: z.number().min(1).max(2),
    ...
  })
  ```

---

### 5. Email & Notifications

#### **Service Email**
- À identifier (possible Resend ou Supabase Auth Mailer)
- Pas de template visible dans la structure actuelle
- ⚠️ **À créer pour le module avis**

#### **Notifications In-App**
- Table `notifications` en base
- Component `<AnalyticsNotifications>` dans dashboard
- System de toast avec Sonner

---

### 6. Conventions Identifiées

#### **Nommage Fichiers/Dossiers**
- Components : `PascalCase.tsx`
- API routes : `route.ts`
- Utilitaires : `kebab-case.ts` ou `camelCase.ts`
- Dossiers : `kebab-case/`

#### **Pattern API Routes**
```typescript
// app/api/[resource]/[action]/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient() // depuis /lib/supabase/server.ts
  const { data: { user } } = await supabase.auth.getUser()
  
  // Validation
  const body = await request.json()
  const validated = schema.parse(body)
  
  // Business logic
  const { data, error } = await supabase.from('table').insert(...)
  
  // Response
  return NextResponse.json({ data }, { status: 200 })
}
```

#### **Pattern Components**
```tsx
'use client' // si client component

import { Component } from '@/components/core/ui/component'
import { useHook } from '@/lib/hooks/useHook'

export function MyFeature() {
  const { data, isLoading } = useHook()
  
  if (isLoading) return <Skeleton />
  
  return (
    <div className="space-y-4">
      {/* Tailwind CSS */}
    </div>
  )
}
```

---

## 📊 PHASE 2 : RAPPORT D'INTÉGRATION

### Architecture Détectée

| Aspect | Valeur |
|--------|--------|
| **Pattern de routing** | Next.js 14 App Router |
| **Structure composants** | Feature-based (core/ + features/) |
| **Gestion d'état** | React Query + Context API |
| **UI Library** | shadcn/ui (Radix UI) |
| **Styling** | Tailwind CSS |
| **Forms** | React Hook Form |
| **Validation** | Zod |
| **Notifications** | Sonner (toast) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |

---

### Points d'Intégration Identifiés

#### **1. Route Dashboard**
- Chemin : `/app/dashboard/avis-clients/page.tsx`
- Layout parent : `/app/dashboard/layout.tsx` (sidebar déjà configurée)
- Ajout à faire dans `navItems` du layout :
  ```ts
  { href: '/dashboard/avis-clients', label: 'Avis Clients', icon: Star }
  ```

#### **2. Structure API**
```
app/api/reviews/
├── create-link/route.ts       # POST: créer lien
├── links/route.ts             # GET: liste liens user
├── links/[id]/route.ts        # GET, PATCH, DELETE: gestion lien
├── submit/route.ts            # POST: soumettre avis (public)
├── [linkId]/route.ts          # GET: avis d'un lien
├── [id]/moderate/route.ts     # PATCH: modération
├── export/[linkId]/route.ts   # GET: export CSV/PDF
└── generate-visual/route.ts   # POST: génération visuel
```

#### **3. Page Publique**
- Route : `/app/avis/[slug]/page.tsx`
- Layout minimal (pas de dashboard)
- Accessible sans authentification

#### **4. Composants à Créer**
```
components/features/reviews/
├── ReviewsTable.tsx           # Table filtrable + actions
├── CreateLinkDialog.tsx       # Modal création lien
├── ReviewCard.tsx             # Card affichage avis
├── StatsCards.tsx             # KPIs dashboard
├── RatingFilter.tsx           # Filtre par étoiles
├── PublicReviewForm.tsx       # Formulaire public
└── VisualGenerator.tsx        # Générateur de visuels sociaux
```

---

### Recommandations d'Adaptation

#### **1. Suivre Conventions Existantes**
- ✅ Utiliser `snake_case` pour tables/colonnes
- ✅ UUID comme clé primaire
- ✅ TIMESTAMPTZ pour dates
- ✅ RLS sur toutes les tables
- ✅ Indexes sur FK et colonnes de recherche

#### **2. Réutiliser Composants Existants**
- `<Button>`, `<Dialog>`, `<Input>`, `<Table>`
- `<Badge>`, `<Alert>`, `<Tabs>`
- Pattern `<EmptyState>` (à créer si n'existe pas)

#### **3. Patterns Data Fetching**
- Créer hooks custom : `useReviewLinks()`, `useReviews()`
- Utiliser React Query pour cache
- Pattern :
  ```ts
  export function useReviewLinks() {
    return useQuery({
      queryKey: ['review-links'],
      queryFn: async () => {
        const res = await fetch('/api/reviews/links')
        return res.json()
      }
    })
  }
  ```

#### **4. Storage pour Médias**
- Créer nouveau bucket : `review-media`
- Politique publique read, write pour authenticated
- Max size : 10MB (images + vidéos)

#### **5. Emails**
- Identifier service email Ofika (Resend recommandé)
- Créer templates :
  - `new-review-notification.tsx`
  - `review-confirmation.tsx`
- Trigger depuis API route `/api/reviews/submit`

---

### Dépendances à Ajouter

```json
{
  "json2csv": "^6.0.0",        // Export CSV
  "jspdf": "^2.5.0",           // Export PDF (optionnel)
  "@vercel/og": "^0.6.0",      // OG image generation (visuels)
  "qrcode": "^1.5.4"           // Déjà présent ✅
}
```

---

## 🏗️ PHASE 3 : PLAN D'IMPLÉMENTATION ADAPTATIF

### Étape 1 : Base de Données (SQL)

#### Tables à Créer

```sql
-- ========================================
-- TABLE : review_links
-- ========================================
CREATE TABLE review_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Config
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  fields_config JSONB DEFAULT '{
    "name_required": false,
    "email_required": false,
    "comment_required": false,
    "media_enabled": false,
    "purchase_verification": false
  }'::jsonb,
  
  -- Métadonnées
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_review_links_user_id ON review_links(user_id);
CREATE INDEX idx_review_links_slug ON review_links(slug);
CREATE INDEX idx_review_links_active ON review_links(is_active) WHERE is_active = true;

-- ========================================
-- TABLE : reviews
-- ========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES review_links(id) ON DELETE CASCADE,
  
  -- Données client
  client_name TEXT,
  client_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  has_purchase BOOLEAN DEFAULT false,
  
  -- Média
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  
  -- Anti-fraude
  ip_address INET,
  user_agent TEXT,
  fingerprint TEXT,
  
  -- Modération
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index essentiels
CREATE INDEX idx_reviews_link_id ON reviews(link_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_email ON reviews(client_email) WHERE client_email IS NOT NULL;
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX idx_reviews_link_rating_date ON reviews(link_id, rating, created_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- review_links
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_links_select" ON review_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "review_links_insert" ON review_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_links_update" ON review_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "review_links_delete" ON review_links
  FOR DELETE USING (auth.uid() = user_id);

-- reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Propriétaire voit les avis de ses liens
CREATE POLICY "reviews_select_owner" ON reviews
  FOR SELECT USING (
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid()
    )
  );

-- Insertion publique (formulaire)
CREATE POLICY "reviews_insert_public" ON reviews
  FOR INSERT WITH CHECK (true);

-- Mise à jour réservée au propriétaire (modération)
CREATE POLICY "reviews_update_owner" ON reviews
  FOR UPDATE USING (
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid()
    )
  );

-- Suppression réservée au propriétaire
CREATE POLICY "reviews_delete_owner" ON reviews
  FOR DELETE USING (
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger updated_at pour review_links
CREATE TRIGGER trigger_review_links_updated_at
  BEFORE UPDATE ON review_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger updated_at pour reviews
CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STORAGE BUCKET
-- ========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-media',
  'review-media',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Politiques Storage
CREATE POLICY "review_media_read_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'review-media');

CREATE POLICY "review_media_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'review-media');
```

---

### Étape 2 : API Routes

#### `app/api/reviews/create-link/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createLinkSchema = z.object({
  title: z.string().min(1).max(200),
  fields_config: z.object({
    name_required: z.boolean().optional(),
    email_required: z.boolean().optional(),
    comment_required: z.boolean().optional(),
    media_enabled: z.boolean().optional(),
    purchase_verification: z.boolean().optional(),
  }).optional(),
})

// Génère un slug unique
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  const random = Math.random().toString(36).substring(2, 8)
  return `${base}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // Parse & validate
    const body = await request.json()
    const validated = createLinkSchema.parse(body)
    
    // Generate unique slug
    const slug = generateSlug(validated.title)
    
    // Insert
    const { data, error } = await supabase
      .from('review_links')
      .insert({
        user_id: user.id,
        title: validated.title,
        slug,
        fields_config: validated.fields_config || {},
      })
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création' },
        { status: 500 }
      )
    }
    
    // Build public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/avis/${data.slug}`
    
    return NextResponse.json({
      ...data,
      public_url: publicUrl,
    })
    
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

#### `app/api/reviews/submit/route.ts` (Public - sans auth)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const submitReviewSchema = z.object({
  link_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  client_name: z.string().optional(),
  client_email: z.string().email().optional(),
  comment: z.string().optional(),
  has_purchase: z.boolean().optional(),
  media_url: z.string().url().optional(),
  media_type: z.enum(['image', 'video']).optional(),
  fingerprint: z.string().optional(),
})

// Rate limiting simple (en mémoire, à améliorer avec Redis)
const ipLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = ipLimits.get(ip)
  
  if (!limit || now > limit.resetAt) {
    ipLimits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }) // 15min
    return true
  }
  
  if (limit.count >= 5) {
    return false // Max 5 avis par 15min
  }
  
  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de soumissions. Réessayez dans 15 minutes.' },
        { status: 429 }
      )
    }
    
    // Parse & validate
    const body = await request.json()
    const validated = submitReviewSchema.parse(body)
    
    // Vérifier que le lien existe et est actif
    const { data: link, error: linkError } = await supabase
      .from('review_links')
      .select('id, is_active')
      .eq('id', validated.link_id)
      .single()
    
    if (linkError || !link || !link.is_active) {
      return NextResponse.json(
        { error: 'Lien invalide ou inactif' },
        { status: 404 }
      )
    }
    
    // Insert review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        link_id: validated.link_id,
        rating: validated.rating,
        client_name: validated.client_name,
        client_email: validated.client_email,
        comment: validated.comment,
        has_purchase: validated.has_purchase,
        media_url: validated.media_url,
        media_type: validated.media_type,
        ip_address: ip,
        user_agent: request.headers.get('user-agent'),
        fingerprint: validated.fingerprint,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Insert review error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la soumission' },
        { status: 500 }
      )
    }
    
    // TODO: Envoyer email notification au propriétaire
    // await sendReviewNotificationEmail(link.user_id, data)
    
    return NextResponse.json({ data, success: true })
    
  } catch (error) {
    console.error('Submit review error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

---

### Étape 3 : Hooks React Query

#### `lib/hooks/useReviewLinks.ts`

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'

export function useReviewLinks() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['review-links', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/reviews/links')
      if (!res.ok) throw new Error('Erreur chargement liens')
      return res.json()
    },
    enabled: !!user,
  })
}

export function useCreateReviewLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { title: string; fields_config?: any }) => {
      const res = await fetch('/api/reviews/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur création')
      }
      
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-links'] })
    },
  })
}

export function useReviews(linkId?: string) {
  return useQuery({
    queryKey: ['reviews', linkId],
    queryFn: async () => {
      const url = linkId 
        ? `/api/reviews/${linkId}` 
        : '/api/reviews'
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Erreur chargement avis')
      return res.json()
    },
    enabled: !!linkId,
  })
}
```

---

### Étape 4 : Page Dashboard

#### `app/dashboard/avis-clients/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Star, Plus, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/core/ui/button'
import { useReviewLinks, useReviews } from '@/lib/hooks/useReviewLinks'
import { CreateLinkDialog } from '@/components/features/reviews/CreateLinkDialog'
import { ReviewsTable } from '@/components/features/reviews/ReviewsTable'
import { StatsCards } from '@/components/features/reviews/StatsCards'

export default function AvisClientsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { data: links, isLoading } = useReviewLinks()
  const { data: reviews } = useReviews()
  
  // État vide
  if (!isLoading && (!links || links.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <Star className="w-16 h-16 text-gray-400" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Collectez des avis clients authentiques</h2>
          <p className="text-gray-600 max-w-md">
            Créez un lien personnalisé et commencez à recevoir des retours de vos clients en moins de 2 minutes
          </p>
        </div>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✓ Formulaire simple et rapide</li>
          <li>✓ Dashboard de suivi en temps réel</li>
          <li>✓ Export et partage automatique</li>
        </ul>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Créer mon premier lien
        </Button>
        
        <CreateLinkDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    )
  }
  
  // État avec données
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avis Clients</h1>
          <p className="text-gray-600">Gérez et analysez vos avis clients</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau lien
        </Button>
      </div>
      
      <StatsCards data={reviews} />
      
      <ReviewsTable data={reviews} links={links} />
      
      <CreateLinkDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
```

#### Ajout à la sidebar (`app/dashboard/layout.tsx`)

```typescript
import { Star } from 'lucide-react' // Ajouter import

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profiles', label: 'Profils', icon: Users },
  { href: '/dashboard/contacts', label: 'Leads', icon: Users },
  { href: '/dashboard/qr-codes', label: 'QR Codes', icon: QrCode },
  { href: '/dashboard/avis-clients', label: 'Avis Clients', icon: Star }, // ⬅️ NOUVEAU
  { href: '/dashboard/orders', label: 'Commandes', icon: CreditCard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
]
```

---

### Étape 5 : Page Publique

#### `app/avis/[slug]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicReviewForm } from '@/components/features/reviews/PublicReviewForm'

export default async function PublicReviewPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()
  
  const { data: link, error } = await supabase
    .from('review_links')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()
  
  if (error || !link) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{link.title}</h1>
          <p className="text-gray-600">Votre avis compte énormément pour nous</p>
        </div>
        
        <PublicReviewForm link={link} />
      </div>
    </div>
  )
}
```

---

### Étape 6 : Composants UI

Je vais créer les composants principaux dans les prochains messages. Structure complète prévue :

```
components/features/reviews/
├── CreateLinkDialog.tsx
├── ReviewsTable.tsx
├── StatsCards.tsx
├── PublicReviewForm.tsx
├── ReviewCard.tsx
├── RatingStars.tsx
└── ExportButton.tsx
```

---

## 📝 CHECKLIST DE DÉPLOIEMENT

### Base de données
- [ ] Exécuter le script SQL de création des tables
- [ ] Vérifier que RLS est activé
- [ ] Tester les policies avec différents users
- [ ] Créer le bucket `review-media` dans Storage

### Backend
- [ ] Créer toutes les API routes
- [ ] Tester authentification sur routes protégées
- [ ] Tester soumission publique d'avis
- [ ] Implémenter rate limiting (Redis si production)

### Frontend
- [ ] Créer la page dashboard `/dashboard/avis-clients`
- [ ] Créer la page publique `/avis/[slug]`
- [ ] Créer tous les composants
- [ ] Ajouter l'item de menu dans la sidebar
- [ ] Tests responsive (mobile, tablet, desktop)

### Fonctionnalités
- [ ] Création de lien
- [ ] Soumission d'avis
- [ ] Affichage/filtrage des avis
- [ ] Export CSV
- [ ] Notifications email ()
- [ ] Upload de médias (images/vidéos)

### Tests
- [ ] Test création lien + génération slug unique
- [ ] Test formulaire public avec tous les cas
- [ ] Test filtres et recherche dans le dashboard
- [ ] Test modération d'avis
- [ ] Test export CSV avec données réelles
- [ ] Test rate limiting

---

## 🎯 PROCHAINES ÉTAPES IMMÉDIATES

1. **Valider ce plan** avec l'équipe
2. **Exécuter le script SQL** dans Supabase
3. **Créer les hooks** React Query
4. **Développer les API routes** une par une
5. **Créer les composants UI** en réutilisant shadcn/ui
6. **Tester l'intégration** complète

---

**Prêt à commencer l'implémentation ! 🚀**

*Document créé le 2025-12-08 par Antigravity AI*
