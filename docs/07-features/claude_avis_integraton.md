Pour : Développeur / Claude / Antigravity
Projet : OFIKA - Module de collecte d'avis clients
Stack : React/Next.js + Supabase/PostgreSQL

📋 PHASE 1 : ANALYSE DU CODE EXISTANT (OBLIGATOIRE)
Avant toute implémentation, tu dois analyser en profondeur la structure actuelle du SaaS Ofika pour garantir une intégration harmonieuse.
🔍 Checklist d'analyse
1. Architecture & Structure

 Examiner l'arborescence des dossiers (/pages, /components, /lib, /api, etc.)
 Identifier le pattern de routing utilisé (App Router vs Pages Router)
 Repérer la structure des composants (atomic design, feature-based, etc.)
 Comprendre l'organisation des styles (CSS Modules, Tailwind, Styled-components)

2. Base de données & Backend

 Analyser le schéma Supabase existant (tables, relations, RLS policies)
 Identifier les conventions de nommage des tables et colonnes
 Repérer les Edge Functions ou API routes existantes
 Comprendre le système d'authentification (Auth helpers, middleware)

3. État & Data Management

 Identifier la gestion d'état (Context, Redux, Zustand, React Query)
 Repérer les hooks personnalisés existants
 Comprendre la stratégie de cache et fetching des données

4. UI/UX & Design System

 Identifier la bibliothèque de composants (shadcn/ui, Material UI, custom)
 Repérer les tokens de design (couleurs, espacements, typographie)
 Analyser les patterns de navigation (sidebar, topbar, breadcrumbs)
 Comprendre le système de notifications/toasts

5. Sécurité & Permissions

 Identifier le système de rôles/permissions
 Repérer les middleware de protection des routes
 Comprendre la gestion des erreurs et validations

6. Email & Notifications

 Identifier le service d'emailing (Resend, SendGrid, Supabase Auth)
 Repérer les templates d'emails existants
 Comprendre le système de notifications in-app


📊 PHASE 2 : RAPPORT D'ANALYSE & PLAN D'INTÉGRATION
Après l'analyse, génère un rapport structuré :
markdown## RAPPORT D'ANALYSE - OFIKA

### 1. Architecture détectée
- Pattern de routing : [App Router / Pages Router]
- Structure composants : [description]
- Gestion d'état : [solution utilisée]

### 2. Conventions identifiées
- Nommage tables : [snake_case / camelCase]
- Nommage composants : [PascalCase / autres]
- Structure dossiers : [description]

### 3. Technologies en place
- UI Library : [shadcn / autre]
- Styling : [Tailwind / autre]
- Forms : [React Hook Form / autre]
- Validation : [Zod / Yup / autre]

### 4. Points d'intégration identifiés
- Route du dashboard : [chemin]
- Composant layout principal : [fichier]
- Config Supabase : [emplacement]
- API handler pattern : [structure]

### 5. Recommandations d'adaptation
- [Liste des ajustements nécessaires]
- [Patterns à suivre]
- [Dépendances à ajouter]
```

---

## 🏗️ PHASE 3 : IMPLÉMENTATION ADAPTATIVE

### 🎯 Objectif du Module

Créer une fonctionnalité **native et cohérente** de collecte d'avis clients qui s'intègre parfaitement dans l'écosystème existant d'Ofika.

**Flow utilisateur :**
```
Génération lien → Partage client → Client soumet avis → Dashboard consulte/exporte

🗂️ MODÈLE BASE DE DONNÉES
Table : review_links
sqlCREATE TABLE review_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  fields_config JSONB DEFAULT '{
    "name_required": false,
    "email_required": false,
    "comment_required": false,
    "media_enabled": false,
    "purchase_verification": false
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_review_links_user_id ON review_links(user_id);
CREATE INDEX idx_review_links_slug ON review_links(slug);
CREATE INDEX idx_review_links_active ON review_links(is_active);
Table : reviews
sqlCREATE TABLE reviews (
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
  media_type TEXT, -- 'image' | 'video'
  
  -- Anti-fraude
  ip_address INET,
  user_agent TEXT,
  fingerprint TEXT, -- hash unique browser
  
  -- Modération
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  moderation_status TEXT DEFAULT 'pending', -- pending | approved | rejected
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index essentiels
CREATE INDEX idx_reviews_link_id ON reviews(link_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_email ON reviews(client_email);
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status);

-- Index composite pour dashboard
CREATE INDEX idx_reviews_link_rating_date ON reviews(link_id, rating, created_at DESC);
Row Level Security (RLS)
sql-- review_links : utilisateur ne voit que ses liens
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links"
  ON review_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own links"
  ON review_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
  ON review_links FOR UPDATE
  USING (auth.uid() = user_id);

-- reviews : utilisateur voit les avis de ses liens
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews of their links"
  ON reviews FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid()
    )
  );

-- Insertion publique autorisée (formulaire public)
CREATE POLICY "Anyone can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

🔌 API / ENDPOINTS
Structure adaptative
Suivre le pattern existant détecté (exemple App Router) :
typescript// app/api/reviews/create-link/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { title, fields_config } = await request.json()
  
  // Validation
  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }
  
  // Générer slug unique
  const slug = generateUniqueSlug(title)
  
  // Insert avec user_id depuis session
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('review_links')
    .insert({
      user_id: user.id,
      title,
      slug,
      fields_config
    })
    .select()
    .single()
  
  if (error) return NextResponse.json({ error }, { status: 500 })
  
  return NextResponse.json({
    ...data,
    public_url: `${process.env.NEXT_PUBLIC_APP_URL}/avis/${slug}`
  })
}
```

### Endpoints requis
```
POST   /api/reviews/create-link       → Créer un nouveau lien
GET    /api/reviews/links             → Liste liens de l'user
GET    /api/reviews/links/[id]        → Détails + stats d'un lien
PATCH  /api/reviews/links/[id]        → Modifier config lien
DELETE /api/reviews/links/[id]        → Supprimer lien

GET    /api/reviews/[linkId]          → Liste avis d'un lien (avec filtres)
POST   /api/reviews/submit            → Soumettre avis (public)
PATCH  /api/reviews/[id]/moderate     → Modérer un avis
DELETE /api/reviews/[id]              → Supprimer avis

GET    /api/reviews/export/[linkId]   → Export CSV/PDF
POST   /api/reviews/generate-visual   → Génération carte sociale

🎨 UI/UX - STRUCTURE DES PAGES
1. Page Dashboard Principal
Route : /dashboard/avis-clients
États :
A. État vide (onboarding)
tsx<EmptyState
  icon={<Star className="w-16 h-16" />}
  title="Collectez des avis clients authentiques"
  description="Créez un lien personnalisé et commencez à recevoir des retours de vos clients en moins de 2 minutes"
  action={
    <Button onClick={openCreateModal}>
      <Plus /> Créer mon premier lien
    </Button>
  }
  features={[
    "Formulaire simple et rapide",
    "Dashboard de suivi en temps réel",
    "Export et partage automatique"
  ]}
/>
B. État avec données
tsx<DashboardLayout>
  <Header>
    <Stats>
      <StatCard label="Total avis" value={totalReviews} />
      <StatCard label="Note moyenne" value={avgRating} icon="⭐" />
      <StatCard label="Taux positif" value={positiveRate} trend="+12%" />
    </Stats>
    <Actions>
      <Button variant="primary" onClick={openCreateModal}>
        <Plus /> Nouveau lien
      </Button>
    </Actions>
  </Header>
  
  <Tabs defaultValue="all">
    <TabsList>
      <TabsTrigger value="all">Tous les avis ({count})</TabsTrigger>
      <TabsTrigger value="links">Mes liens ({linkCount})</TabsTrigger>
    </TabsList>
    
    <TabsContent value="all">
      <ReviewsTable />
    </TabsContent>
  </Tabs>
</DashboardLayout>
2. Composant ReviewsTable (avec filtres avancés)
tsx<DataTable>
  <Filters>
    <SearchInput placeholder="Rechercher par nom, email, commentaire..." />
    <FilterGroup>
      <RatingFilter /> {/* 1-5 étoiles */}
      <DateRangeFilter />
      <LinkFilter /> {/* Par lien/produit */}
      <StatusFilter /> {/* Vérifié, en attente, public */}
    </FilterGroup>
    <Actions>
      <ExportButton format="csv" />
      <ExportButton format="pdf" />
      <Button variant="outline">
        <Share2 /> Générer visuel
      </Button>
    </Actions>
  </Filters>
  
  <Table>
    <Columns>
      - Client (nom + email)
      - Note (⭐ visuel)
      - Commentaire (preview)
      - Lien/Produit
      - Date
      - Statut (badge)
      - Actions (voir, modérer, supprimer)
    </Columns>
  </Table>
</DataTable>
3. Modal Création de Lien
tsx<Dialog>
  <Form onSubmit={handleCreate}>
    <Field>
      <Label>Nom du lien</Label>
      <Input 
        placeholder="Ex: Avis sur notre service de coaching"
        required
      />
      <Helper>Ce nom sera visible par vos clients</Helper>
    </Field>
    
    <Divider />
    
    <SectionTitle>Configuration du formulaire</SectionTitle>
    
    <ToggleGroup>
      <Toggle name="name_required" label="Nom obligatoire" />
      <Toggle name="email_required" label="Email obligatoire" />
      <Toggle name="comment_required" label="Commentaire obligatoire" />
      <Toggle name="media_enabled" label="Autoriser photo/vidéo" />
      <Toggle name="purchase_verification" label="Vérification d'achat" />
    </ToggleGroup>
    
    <Alert variant="info">
      Plus vous demandez d'informations, plus le taux d'abandon peut augmenter. 
      On recommande : Email optionnel + Commentaire optionnel.
    </Alert>
    
    <Actions>
      <Button variant="ghost" onClick={close}>Annuler</Button>
      <Button type="submit" loading={isCreating}>
        Générer le lien
      </Button>
    </Actions>
  </Form>
</Dialog>
4. Modal Succès Création
tsx<Dialog>
  <SuccessIcon />
  <Title>Lien créé avec succès ! 🎉</Title>
  
  <LinkDisplay>
    <Label>Votre lien public</Label>
    <CopyInput value={publicUrl} />
  </LinkDisplay>
  
  <QuickActions>
    <Button variant="outline" onClick={() => window.open(publicUrl)}>
      <ExternalLink /> Tester le lien
    </Button>
    <Button variant="outline" onClick={shareWhatsApp}>
      <MessageCircle /> Partager sur WhatsApp
    </Button>
    <Button variant="outline" onClick={shareEmail}>
      <Mail /> Envoyer par email
    </Button>
  </QuickActions>
  
  <Embed>
    <Label>Code QR</Label>
    <QRCode value={publicUrl} />
    <DownloadButton>Télécharger QR Code</DownloadButton>
  </Embed>
</Dialog>

🌍 PAGE PUBLIQUE FORMULAIRE AVIS
Route : /avis/[slug] ou /r/[slug] (à adapter selon routes existantes)
Design minimaliste & conversion optimisée
tsx<PublicReviewPage>
  {/* Header simple */}
  <Header>
    <Logo src={businessLogo || ofika Logo} />
    <Title>{linkTitle}</Title>
    <Subtitle>Votre avis compte énormément pour nous</Subtitle>
  </Header>
  
  <Form onSubmit={handleSubmit}>
    {/* Rating en premier (obligatoire) */}
    <RatingSection>
      <Label>Comment évaluez-vous votre expérience ?</Label>
      <StarRating 
        size="large" 
        value={rating}
        onChange={setRating}
        required
      />
      <RatingLabel>
        {rating === 5 && "Excellent ! 🤩"}
        {rating === 4 && "Très bien 👍"}
        {rating === 3 && "Bien"}
        {rating === 2 && "Moyen"}
        {rating === 1 && "Décevant"}
      </RatingLabel>
    </RatingSection>
    
    {/* Champs conditionnels selon config */}
    {config.name_required !== false && (
      <Field>
        <Label>Votre nom {config.name_required && '*'}</Label>
        <Input 
          placeholder="Jean Dupont"
          required={config.name_required}
        />
      </Field>
    )}
    
    {config.email_required !== false && (
      <Field>
        <Label>Votre email {config.email_required && '*'}</Label>
        <Input 
          type="email"
          placeholder="jean@example.com"
          required={config.email_required}
        />
        <Helper>Pour vous envoyer une copie de votre avis</Helper>
      </Field>
    )}
    
    <Field>
      <Label>
        Votre commentaire {config.comment_required && '*'}
      </Label>
      <Textarea 
        placeholder="Partagez votre expérience en quelques mots..."
        rows={4}
        required={config.comment_required}
      />
    </Field>
    
    {config.purchase_verification && (
      <Checkbox>
        <Check id="purchase" />
        <Label htmlFor="purchase">
          J'ai acheté ce produit/service
        </Label>
      </Checkbox>
    )}
    
    {config.media_enabled && (
      <MediaUpload>
        <Label>Photo ou vidéo (optionnel)</Label>
        <UploadZone 
          accept="image/*,video/*"
          maxSize={10} // MB
          onUpload={handleMediaUpload}
        />
        <Helper>
          Une photo de votre achat renforce la crédibilité de votre avis
        </Helper>
      </MediaUpload>
    )}
    
    <SubmitButton 
      disabled={!rating || isSubmitting}
      loading={isSubmitting}
    >
      Envoyer mon avis
    </SubmitButton>
    
    <Legal>
      En soumettant cet avis, vous acceptez qu'il soit publié publiquement.
    </Legal>
  </Form>
  
  {/* Footer discret */}
  <Footer>
    <PoweredBy>
      Propulsé par <Link href="/">Ofika</Link>
    </PoweredBy>
  </Footer>
</PublicReviewPage>
Page de confirmation
tsx<SuccessPage>
  <CheckCircle className="w-20 h-20 text-green-500" />
  <Title>Merci pour votre avis ! 🙏</Title>
  <Message>
    Votre retour est précieux et aide d'autres clients à faire le bon choix.
  </Message>
  
  {clientEmail && (
    <Alert variant="success">
      Un récapitulatif a été envoyé à {clientEmail}
    </Alert>
  )}
  
  <Actions>
    <Button onClick={() => window.close()}>Fermer</Button>
  </Actions>
</SuccessPage>

🔐 SÉCURITÉ & ANTI-FRAUDE
1. Détection des avis frauduleux
typescript// lib/anti-fraud.ts

interface FraudCheckResult {
  isValid: boolean
  reasons: string[]
  riskScore: number // 0-100
}

export async function checkReviewFraud(
  data: SubmitReviewData,
  linkConfig: ReviewLinkConfig
): Promise<FraudCheckResult> {
  const reasons: string[] = []
  let riskScore = 0
  
  // 1. Vérifier IP duplicate
  if (linkConfig.preventDuplicateIP) {
    const existingByIP = await checkExistingReviewByIP(
      data.ip_address,
      data.link_id,
      '24 hours' // période de blocage
    )
    if (existingByIP) {
      reasons.push('IP déjà utilisée récemment')
      riskScore += 40
    }
  }
  
  // 2. Vérifier email duplicate
  if (data.client_email && linkConfig.preventDuplicateEmail) {
    const existingByEmail = await checkExistingReviewByEmail(
      data.client_email,
      data.link_id
    )
    if (existingByEmail) {
      reasons.push('Email déjà utilisé pour ce lien')
      riskScore += 50
    }
  }
  
  // 3. Fingerprint browser
  const existingByFingerprint = await checkFingerprint(
    data.fingerprint,
    data.link_id,
    '48 hours'
  )
  if (existingByFingerprint) {
    reasons.push('Appareil déjà utilisé récemment')
    riskScore += 30
  }
  
  // 4. Analyse contenu suspect
  if (data.comment) {
    const spamScore = await analyzeSpamContent(data.comment)
    if (spamScore > 0.7) {
      reasons.push('Contenu potentiellement spam')
      riskScore += 35
    }
  }
  
  // 5. Vélocité d'avis
  const recentReviews = await getRecentReviewsCount(data.link_id, '1 hour')
  if (recentReviews > 10) {
    reasons.push('Trop d\'avis en peu de temps')
    riskScore += 20
  }
  
  return {
    isValid: riskScore < 70, // seuil de rejet
    reasons,
    riskScore
  }
}
2. Middleware de rate limiting
typescript// middleware pour l'API publique
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 avis par 15min par IP
})

export async function rateLimitReviewSubmission(
  req: Request
): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await ratelimit.limit(ip)
  return success
}

📧 SYSTÈME D'EMAILS
Templates à créer (suivre le pattern email existant)
1. Email notification propriétaire
typescript// emails/new-review-notification.tsx
export const NewReviewEmail = ({
  ownerName,
  linkTitle,
  rating,
  clientName,
  comment,
  dashboardUrl
}: NewReviewEmailProps) => (
  <Email>
    <Heading>Nouvel avis reçu ! ⭐</Heading>
    <Text>Bonjour {ownerName},</Text>
    <Text>
      Vous avez reçu un nouvel avis sur <Strong>{linkTitle}</Strong>
    </Text>
    
    <ReviewCard>
      <Rating stars={rating} />
      <Author>{clientName || 'Client anonyme'}</Author>
      <Comment>{comment}</Comment>
    </ReviewCard>
    
    <Button href={dashboardUrl}>
      Voir dans votre dashboard
    </Button>
    
    <Footer>
      Ofika - Gestion d'avis clients
    </Footer>
  </Email>
)
2. Email récapitulatif client (optionnel)
typescriptexport const ReviewConfirmationEmail = ({
  clientName,
  linkTitle,
  rating,
  comment
}: ReviewConfirmationProps) => (
  <Email>
    <Heading>Merci pour votre avis ! 🙏</Heading>
    <Text>Bonjour {clientName},</Text>
    <Text>
      Votre avis sur {linkTitle} a bien été enregistré.
    </Text>
    
    <ReviewSummary>
      <Rating stars={rating} />
      <Comment>{comment}</Comment>
    </ReviewSummary>
    
    <Text>
      Votre retour aide d'autres clients à faire le bon choix.
    </Text>
  </Email>
)
Trigger d'envoi
typescript// api/reviews/submit/route.ts (extrait)

// Après insertion avis
const { data: review } = await supabase
  .from('reviews')
  .insert(reviewData)
  .select()
  .single()

// Récupérer info du propriétaire
const { data: link } = await supabase
  .from('review_links')
  .select('*, user:users(*)')
  .eq('id', review.link_id)
  .single()

// Envoyer notification
await sendEmail({
  to: link.user.email,
  subject: `Nouvel avis ${rating}/5 ⭐ - ${link.title}`,
  template: 'new-review-notification',
  data: {
    ownerName: link.user.full_name,
    linkTitle: link.title,
    rating: review.rating,
    clientName: review.client_name,
    comment: review.comment,
    dashboardUrl: `${APP_URL}/dashboard/avis-clients?highlight=${review.id}`
  }
})

📊 ANALYTICS & INSIGHTS
Composant StatsDashboard
tsx<StatsSection>
  <Grid cols={4}>
    <StatCard
      label="Total avis"
      value={stats.totalReviews}
      trend={stats.reviewsTrend}
      icon={<MessageSquare />}
    />
    <StatCard
      label="Note moyenne"
      value={`${stats.avgRating}/5`}
      trend={stats.ratingTrend}
      icon={<Star />}
      variant="primary"
    />
    <StatCard
      label="Taux positif"
      value={`${stats.positiveRate}%`}
      description="Avis 4-5 étoiles"
      icon={<TrendingUp />}
      variant="success"
    />
    <StatCard
      label="Taux réponse"
      value={`${stats.responseRate}%`}
      description="Sur liens partagés"
      icon={<Users />}
    />
  </Grid>
  
  <Charts>
    <RatingDistributionChart data={stats.ratingBreakdown} />
    <TimelineChart data={stats.reviewsOverTime} />
  </Charts>
  
  <InsightsPanel>
    <Alert variant="info">
      💡 <Strong>Insight:</Strong> Vos avis 5 étoiles ont augmenté de 23% ce mois-ci !
    </Alert>
  </InsightsPanel>
</StatsSection>

🎨 GÉNÉRATION DE VISUELS PARTAGEABLES
Composant SocialProofGenerator
tsx<VisualGenerator>
  <Preview>
    <VisualCard style={selectedStyle}>
      <Header>
        <Logo src={brandLogo} />
        <BusinessName>{businessName}</BusinessName>
      </Header>
      
      <ReviewContent>
        <Rating stars={selectedReview.rating} size="large" />
        <Quote>"{selectedReview.comment}"</Quote>
        <Author>— {selectedReview.client_name}</Author>
      </ReviewContent>
      
      <Footer>
        <OverallRating>
          {avgRating}/5 · {totalReviews} avis
        </OverallRating>
      </Footer>
    </VisualCard>
  </Preview>
  
  <Controls>
    <Select label="Style" options={visualStyles} />
    <Select label="Avis à afficher" options={topReviews} />
    <ColorPicker label="Couleur principale" />
    <ToggleGroup>
      <Toggle label="Afficher logo" />
      <Toggle label="Afficher nom client" />
    </ToggleGroup>
    
    <Actions>
      <Button onClick={downloadImage}>
        <Download /> Télécharger (PNG)
      </Button>
      <Button variant="outline" onClick={copyToClipboard}>
        <Copy /> Copier l'image
      </Button>
    </Actions>
  </Controls>
</VisualGenerator>
Génération côté serveur avec Satori/OG image :
typescript// api/reviews/generate-visual/route.ts
import { ImageResponse } from '@vercel/og'

export async function POST(req: Request) {
  const { reviewId, style } = await req.json()
  
  const review = await getReviewData(reviewId)
  
  return new ImageResponse(
    (
      <div style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        // ... styles selon template choisi
      }}>
        <ReviewVisualTemplate review={review} style={style} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

📤 EXPORT DE DONNÉES
Export CSV
typescript// lib/export/csv.ts
import { parse } from 'json2csv'

export async function exportReviewsToCSV(
  linkId: string,
  filters?: ReviewFilters
): Promise<string> {
  const reviews = await getReviews(linkId, filters)
  
  const fields = [
    { label: 'Date', value: 'created_at' },
    { label: 'Note', value: 'rating' },
    { label: 'Nom', value: 'client_name' },
    { label: 'Email', value: 'client_email' },
    { label: 'Commentaire', value: 'comment' },
    { label: 'Vérifié', value: 'is_verified' },
    { label: 'A acheté', value: 'has_purchase' }
  ]
  
  const csv = parse(reviews, { fields })
  return csv
}
Export PDF (avec témoignages visuels)
typescript// lib/export/pdf.ts
import { jsPDF } from 'jspdf'

export async function exportReviewsToPDF(
  linkId: string,
  options: PDFExportOptions
): Promise<Blob> {
  const doc = new jsPDF()
  const reviews = await getReviews(linkId)
  const stats = await getReviewStats(linkId)
  
  // Page 1: Vue d'ensemble
  doc.setFontSize(24)
  doc.text('Rapport d\'avis clients', 20, 20)
  
  doc.setFontSize(12)
  doc.text(`Généré le ${new Date().toLocaleDateString()}`, 20, 30)
  
  // Stats globales
  doc.setFontSize(16)
  doc.text('Statistiques', 20, 50)
  doc.setFontSize(12)
  doc.text(`KContinuerTotal avis: ${stats.totalReviews}, 20, 60)   doc.text(Note moyenne: ${stats.avgRating}/5`, 20, 70)
// Pages suivantes: avis détaillés
reviews.forEach((review, index) => {
if (index > 0 && index % 5 === 0) {
doc.addPage()
}
// ... render review
})
return doc.output('blob')
}

---

## 🧪 TESTS & VALIDATION

### Checklist de tests avant déploiement
```markdown
## Tests Fonctionnels

### Création de lien
- [ ] Création avec config minimale
- [ ] Création avec tous les champs activés
- [ ] Génération slug unique
- [ ] Affichage URL correcte
- [ ] Copie dans presse-papier
- [ ] Partage WhatsApp fonctionnel
- [ ] QR Code généré

### Formulaire public
- [ ] Affichage selon config
- [ ] Validation champs obligatoires
- [ ] Soumission rating seul
- [ ] Soumission avec tous les champs
- [ ] Upload média (image)
- [ ] Upload média (vidéo)
- [ ] Message succès affiché
- [ ] Email confirmation envoyé

### Dashboard
- [ ] Affichage liste avis
- [ ] Filtres fonctionnels (rating, date, lien)
- [ ] Recherche texte
- [ ] Tri par colonne
- [ ] Pagination
- [ ] Actions (voir, modérer, supprimer)
- [ ] Export CSV
- [ ] Export PDF
- [ ] Génération visuel social

### Anti-fraude
- [ ] Blocage duplicate IP
- [ ] Blocage duplicate email
- [ ] Rate limiting API
- [ ] Détection spam

### Notifications
- [ ] Email propriétaire (nouvel avis)
- [ ] Email client (confirmation)
- [ ] Notification in-app

## Tests Performance
- [ ] Page publique < 2s chargement
- [ ] Dashboard < 3s avec 1000+ avis
- [ ] Upload média < 5s
- [ ] Export CSV < 10s

## Tests Sécurité
- [ ] RLS actif et fonctionnel
- [ ] Pas d'accès avis autres users
- [ ] Validation côté serveur
- [ ] Protection CSRF
- [ ] Sanitization inputs

## Tests Responsive
- [ ] Mobile (formulaire public)
- [ ] Tablette (dashboard)
- [ ] Desktop (toutes pages)
```

---

## 🚀 PLAN DE DÉPLOIEMENT

### Phase 1 : Infrastructure (Jour 1-2)
1. Créer tables Supabase
2. Configurer RLS policies
3. Créer storage bucket pour médias
4. Setup Edge Functions si nécessaire

### Phase 2 : Backend (Jour 3-5)
1. Implémenter API routes
2. Logique anti-fraude
3. Système notifications
4. Tests unitaires

### Phase 3 : Frontend (Jour 6-10)
1. Pages dashboard
2. Composants UI
3. Formulaire public
4. Intégration APIs

### Phase 4 : Features avancées (Jour 11-13)
1. Export CSV/PDF
2. Génération visuels
3. Analytics dashboard
4. Onboarding

### Phase 5 : Tests & Polish (Jour 14-15)
1. Tests E2E
2. Bug fixes
3. Optimisations performance
4. Documentation

---

## 📚 LIVRABLES ATTENDUS

### Code
- [ ] Tables Supabase + migrations
- [ ] API routes complètes
- [ ] Composants React/Next.js
- [ ] Hooks personnalisés
- [ ] Utilities & helpers
- [ ] Tests (unit + integration)

### Documentation
- [ ] README module
- [ ] Guide d'utilisation user
- [ ] Documentation API
- [ ] Guide troubleshooting

### Design
- [ ] Tous les composants UI
- [ ] Page formulaire public
- [ ] Emails templates
- [ ] Visuels exportables

### Qualité
- [ ] Code review effectuée
- [ ] Tests passés à 100%
- [ ] Performance validée
- [ ] Accessibilité (WCAG AA)
- [ ] SEO (page publique)

---

## 🎯 CRITÈRES DE SUCCÈS

### Technique
- ✅ 0 erreur console
- ✅ Lighthouse Score > 90
- ✅ 100% type-safe (TypeScript)
- ✅ Bundle size optimisé

### UX
- ✅ Formulaire complété en < 30 secondes
- ✅ Dashboard intuitif sans formation
- ✅ 0 friction utilisateur

### Business
- ✅ Génération lien en < 2 minutes
- ✅ Taux conversion formulaire > 60%
- ✅ NPS module > 8/10

---

## 💡 AMÉLIORATIONS FUTURES (V2)

### Phase 2 (post-MVP)
- Widget embed pour site web
- API publique pour intégrations
- Webhooks événements
- Réponses aux avis
- Badge "Avis vérifié"
- Import avis depuis Google/Trustpilot

### Phase 3 (avancé)
- Analyse IA sentiments
- Suggestions réponses automatiques
- A/B testing formulaires
- Gamification (incentives)
- Intégration CRM

---

## 🤝 QUESTIONS À CLARIFIER AVEC L'ÉQUIPE OFIKA

Avant de commencer l'implémentation, merci de préciser :

1. **Stack détaillée actuelle**
   - Version Next.js ? (App Router / Pages Router)
   - UI Library ? (shadcn/ui, autre)
   - État management ? (Context, Zustand, React Query)

2. **Design System**
   - Palette couleurs brand ?
   - Composants partagés existants ?
   - Tokens de design ?

3. **Permissions & Rôles**
   - Qui peut créer des liens ? (tous users / admin)
   - Modération nécessaire ?
   - Différents niveaux accès ?

4. **Email & Notifications**
   - Service email actuel ? (Resend, SendGrid, autre)
   - Templates existants à réutiliser ?
   - Fréquence notifications ?

5. **Business Rules**
   - Limite nombre liens par user ?
   - Limite avis par lien ?
   - Modération manuelle ou auto ?

6. **Intégrations**
   - Besoin API externe ? (Google Reviews, Trustpilot)
   - Webhooks nécessaires ?
   - Analytics tiers ? (GA, Mixpanel)

---

**🎯 Prêt à démarrer l'analyse du code existant dès réception de ces informations.**Claude est une IA et peut faire des erreurs. Veuillez vérifier les réponses.

You are an expert full-stack developer specializing in React/Next.js and Supabase. Your task is to analyze an existing SaaS codebase and create a detailed integration plan for a new feature module, ensuring seamless integration with the existing architecture.

You will be provided with information about an existing codebase and requirements for a new feature to integrate.

Here is the existing codebase information:
<existing_codebase>
{{EXISTING_CODEBASE}}
</existing_codebase>

Here are the project requirements for the new feature:
<project_requirements>
{{PROJECT_REQUIREMENTS}}
</project_requirements>

Your task has THREE mandatory phases that must be completed in order:

## PHASE 1: CODEBASE ANALYSIS

Before proposing any implementation, you MUST thoroughly analyze the existing codebase. Use your <analysis> tags to document your findings as you examine:

**1. Architecture & Structure**
- Identify the folder structure (pages, components, lib, api directories)
- Determine routing pattern (App Router vs Pages Router in Next.js)
- Identify component organization pattern (atomic design, feature-based, etc.)
- Note styling approach (CSS Modules, Tailwind, Styled-components, etc.)

**2. Database & Backend**
- Analyze the Supabase schema (tables, relationships, naming conventions)
- Identify existing RLS (Row Level Security) policies
- Note any Edge Functions or API routes patterns
- Understand authentication setup and helpers

**3. State & Data Management**
- Identify state management solution (Context, Redux, Zustand, React Query, etc.)
- Note custom hooks patterns
- Understand data fetching and caching strategies

**4. UI/UX & Design System**
- Identify component library (shadcn/ui, Material UI, custom, etc.)
- Note design tokens (colors, spacing, typography)
- Understand navigation patterns
- Identify notification/toast system

**5. Security & Permissions**
- Understand role/permission system
- Note route protection middleware
- Identify error handling and validation patterns

**6. Email & Notifications**
- Identify email service (Resend, SendGrid, Supabase Auth, etc.)
- Note existing email templates
- Understand in-app notification system

Write your analysis findings inside <analysis> tags, using clear headings for each section.

## PHASE 2: INTEGRATION REPORT

Based on your analysis, create a detailed integration report inside <integration_report> tags with the following structure:

**Architecture Detected:**
- Routing pattern: [specify]
- Component structure: [describe]
- State management: [specify]
- Key conventions identified: [list]

**Technology Stack:**
- UI Library: [specify]
- Styling: [specify]
- Forms: [specify]
- Validation: [specify]

**Integration Points:**
- Dashboard route location: [path]
- Main layout component: [file]
- Supabase config location: [path]
- API handler pattern: [describe]

**Naming Conventions:**
- Database tables: [snake_case/camelCase/etc.]
- Components: [PascalCase/etc.]
- Files: [kebab-case/etc.]
- API routes: [pattern]

**Required Adaptations:**
List specific changes needed to match existing patterns:
- [Adaptation 1]
- [Adaptation 2]
- [etc.]

**Dependencies to Add:**
- [Package 1]: [reason]
- [Package 2]: [reason]

## PHASE 3: ADAPTIVE IMPLEMENTATION PLAN

Now, create a detailed implementation plan that adapts the project requirements to fit seamlessly into the existing codebase. Write this inside <implementation_plan> tags.

Your implementation plan should include:

**1. Database Schema**
- Provide SQL for tables that follow the existing naming conventions
- Include indexes optimized for expected queries
- Write RLS policies that match existing security patterns
- Ensure foreign key relationships align with current schema

**2. API Routes/Endpoints**
- Structure endpoints following the detected routing pattern
- Use the same authentication helpers as existing code
- Follow existing error handling patterns
- Match existing response format conventions

**3. UI Components**
- Use the identified component library and patterns
- Follow existing component structure and naming
- Utilize existing design tokens and styling approach
- Integrate with existing navigation and layout

**4. Features Implementation**
For each major feature in the requirements:
- Explain how it integrates with existing features
- Provide code examples that match the codebase style
- Note any existing utilities or helpers to reuse
- Identify potential conflicts and how to resolve them

**5. Testing Strategy**
- Follow existing testing patterns
- Identify critical paths to test
- Note integration points that need careful testing

**6. Deployment Checklist**
- Database migrations in correct order
- Environment variables needed
- Feature flags if applicable
- Rollback plan

## OUTPUT REQUIREMENTS

Structure your complete response as follows:

1. <analysis> - Your detailed codebase analysis
2. <integration_report> - Structured report of findings and adaptations needed
3. <implementation_plan> - Complete adaptive implementation plan
4. <questions> - Any clarifications needed from the team before proceeding

## QUALITY CRITERIA

Your analysis and plan must:
- Be specific to the actual codebase structure provided
- Identify concrete file paths and patterns, not generic advice
- Provide code examples that match the existing style
- Highlight potential integration challenges
- Suggest solutions that minimize disruption to existing code
- Follow DRY principles by reusing existing utilities
- Maintain consistency with existing conventions

If the existing codebase information is insufficient for proper analysis, clearly state what additional information you need in the <questions> section.

Begin your analysis now.



reply in french