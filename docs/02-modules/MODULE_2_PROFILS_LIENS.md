# MODULE 2 : GESTION DE PROFILS & LIENS

## 🎯 OBJECTIFS DU MODULE

**Durée :** Semaine 2 (7 jours)
**Équipe :** 2-3 développeurs
**Priorité :** Critique (cœur métier)

### Fonctionnalités Core
- ✅ Création/édition profils (3 types max)
- ✅ Gestion liens (2 max par profil)
- ✅ Personnalisation visuelle basique
- ✅ Prévisualisation temps réel
- ✅ URL personnalisée (ofika.co/username)
- ✅ Page profil publique

---

## 🛠️ SPÉCIFICATIONS TECHNIQUES

### Stack Technique
```json
{
  "frontend": {
    "forms": "React Hook Form + Zod",
    "ui": "shadcn/ui components",
    "preview": "Canvas API + CSS",
    "validation": "Zod schemas"
  },
  "backend": {
    "database": "PostgreSQL (Supabase)",
    "storage": "Supabase Storage (images)",
    "cdn": "Supabase CDN"
  },
  "features": {
    "url_generation": "Custom URL slugs",
    "image_processing": "Supabase Image Transform",
    "preview": "Real-time updates"
  }
}
```

### Contraintes Métier
- **Maximum 2 liens par profil**
- **3 profils maximum par utilisateur**
- **Bio limitée à 100 caractères**
- **URL personnalisée unique**

### Architecture Base de Données

```sql
-- Table Links
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(30) NOT NULL,
  url TEXT NOT NULL,
  position INTEGER CHECK (position BETWEEN 1 AND 2),
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contrainte : max 2 liens par profil
CREATE OR REPLACE FUNCTION check_max_links()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM links WHERE profile_id = NEW.profile_id AND is_active = true) >= 2 THEN
    RAISE EXCEPTION 'Maximum 2 links per profile allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_links
  BEFORE INSERT OR UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION check_max_links();

-- Contrainte : max 3 profils par utilisateur
CREATE OR REPLACE FUNCTION check_max_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM profiles WHERE user_id = NEW.user_id AND is_active = true) >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 profiles per user allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_max_profiles();

-- RLS Policies
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile links" ON links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );
```

---

## 🎨 INTERFACE UTILISATEUR

### Pages Principales

#### 1. Dashboard Profils (`/dashboard/profiles`)
```typescript
interface ProfileDashboard {
  profiles: Profile[];
  quickActions: {
    createProfile: () => void;
    editProfile: (id: string) => void;
    viewPublic: (url: string) => void;
  };
  stats: {
    totalViews: number;
    totalClicks: number;
    activeProfiles: number;
  };
}
```

#### 2. Création Profil (`/dashboard/profiles/new`)
- Sélection type profil (Pro/Personnel/Événement)
- Formulaire informations de base
- Upload photo profil
- Prévisualisation temps réel
- Validation en temps réel

#### 3. Édition Profil (`/dashboard/profiles/[id]/edit`)
- Édition informations existantes
- Gestion liens (ajout/suppression/réorganisation)
- Personnalisation visuelle
- Prévisualisation live

#### 4. Page Profil Publique (`/[username]`)
- Affichage optimisé mobile
- Informations contact
- Liens sociaux (max 2)
- Bouton "Add to Contacts"
- Analytics basiques

### Composants shadcn/ui Utilisés
- `Form` - Formulaires validation
- `Input` - Champs de saisie
- `Textarea` - Bio utilisateur
- `Button` - Actions principales
- `Card` - Conteneurs profils
- `Badge` - Statuts et types
- `Avatar` - Photos profil
- `Dialog` - Modales confirmation
- `Toast` - Notifications

---

## 🔧 FONCTIONNALITÉS DÉTAILLÉES

### Gestion des Liens

#### Types de Liens Supportés
```typescript
type LinkType = 
  | 'website'      // Site web
  | 'social'       // Réseaux sociaux
  | 'contact'      // Contact direct
  | 'document'     // Documents PDF
  | 'payment'      // Paiements
  | 'location';    // Localisation

interface Link {
  id: string;
  title: string;
  url: string;
  type: LinkType;
  position: 1 | 2;
  clickCount: number;
  isActive: boolean;
}
```

#### Validation des URLs
```typescript
const linkSchema = z.object({
  title: z.string().min(1).max(30),
  url: z.string().url(),
  type: z.enum(['website', 'social', 'contact', 'document', 'payment', 'location']),
  position: z.enum([1, 2])
});
```

### Personnalisation Visuelle

#### Thèmes Disponibles
```typescript
type Theme = 'light' | 'dark' | 'auto';

interface ProfileTheme {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: 'inter' | 'geist';
  layout: 'minimal' | 'detailed' | 'creative';
}
```

#### Couleurs Ofika
```css
:root {
  --ofika-orange: oklch(0.7 0.15 45);
  --ofika-pink: oklch(0.75 0.12 350);
  --ofika-gradient: linear-gradient(135deg, #d2691e, #cc5500, #b91c7c);
}
```

---

## 📱 PAGE PROFIL PUBLIQUE

### Structure de la Page
```typescript
interface PublicProfile {
  user: {
    name: string;
    bio: string;
    image: string;
    company?: string;
    title?: string;
  };
  links: Link[];
  theme: ProfileTheme;
  analytics: {
    viewCount: number;
    lastViewed: Date;
  };
}
```

### Optimisations Mobile
- **Performance** : Lazy loading images
- **SEO** : Meta tags dynamiques
- **Accessibilité** : ARIA labels
- **PWA** : Service worker basique

### Code de la Page Publique
```typescript
// app/[username]/page.tsx
export default async function PublicProfile({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username);
  
  if (!profile) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ofika-orange to-ofika-pink">
      <ProfileHeader user={profile.user} />
      <ProfileLinks links={profile.links} />
      <AddToContactsButton profile={profile} />
      <ProfileAnalytics analytics={profile.analytics} />
    </div>
  );
}
```

---

## 🔐 SÉCURITÉ OWASP

### A01:2021 - Broken Access Control
- ✅ RLS policies sur table links
- ✅ Validation ownership profils
- ✅ Rate limiting création profils

### A03:2021 - Injection
- ✅ Validation Zod côté client/serveur
- ✅ Sanitization URLs
- ✅ Prepared statements PostgreSQL

### A05:2021 - Security Misconfiguration
- ✅ CORS headers configurés
- ✅ Content Security Policy
- ✅ Image upload validation

### A08:2021 - Software Integrity
- ✅ Validation images upload
- ✅ Scan malware fichiers
- ✅ Checksums intégrité

---

## 📋 LIVRABLES SEMAINE 2

### Jour 1-2 : CRUD Profils
- [ ] Interface création profil
- [ ] Édition profil existant
- [ ] Upload images profil
- [ ] Validation formulaires
- [ ] Tests unitaires

### Jour 3-4 : Gestion Liens
- [ ] Ajout/suppression liens
- [ ] Réorganisation drag & drop
- [ ] Validation URLs
- [ ] Limitation 2 liens max
- [ ] Tests intégration

### Jour 5-6 : Page Publique
- [ ] Page profil publique
- [ ] Optimisation mobile
- [ ] SEO meta tags
- [ ] Analytics basiques
- [ ] Tests performance

### Jour 7 : Tests & Optimisation
- [ ] Tests end-to-end
- [ ] Debug sécurité
- [ ] Optimisation performance
- [ ] Documentation API
- [ ] Déploiement staging

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Techniques
- ✅ Temps création profil < 3 minutes
- ✅ Taux d'abandon < 15%
- ✅ Performance page publique < 2s
- ✅ SEO score > 90

### KPIs Utilisateur
- ✅ Profils créés par utilisateur > 1.5
- ✅ Liens ajoutés par profil > 1.2
- ✅ Temps session > 5 minutes
- ✅ Satisfaction > 4/5

---

## 🚀 DÉPLOIEMENT

### Variables d'Environnement
```env
NEXT_PUBLIC_APP_URL=https://ofika.app
SUPABASE_STORAGE_BUCKET=profiles
SUPABASE_IMAGE_TRANSFORM_URL=your_transform_url
```

### Checklist Déploiement
- [ ] Base de données migrée
- [ ] Images CDN configuré
- [ ] Tests automatisés passent
- [ ] Performance optimisée
- [ ] SEO configuré
- [ ] Monitoring activé

---

## 🔄 PROCHAINES ÉTAPES

**Module suivant :** MODULE_3_CARTES_NFC_QR.md
**Dépendances :** Profils et liens fonctionnels
**Timeline :** Semaine 2 (parallèle)

**Validation requise avant de continuer :**
- [ ] CRUD profils complet
- [ ] Gestion liens opérationnelle
- [ ] Page publique fonctionnelle
- [ ] Contraintes métier respectées
- [ ] Tests passent à 100%
