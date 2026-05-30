# 🚀 Implémentation des 5 Fonctionnalités Ofika

## 📋 Table des matières
1. [Analyse du code existant](#analyse)
2. [Fonctionnalité 1 : Émotions/Emojis](#feature-1)
3. [Fonctionnalité 2 : Notifications Push Web](#feature-2)
4. [Fonctionnalité 3 : Rappels Automatisés](#feature-3)
5. [Fonctionnalité 4 : Consentement RGPD](#feature-4)
6. [Fonctionnalité 5 : Sécurité](#feature-5)
7. [Tests](#tests)
8. [Coûts & Déploiement](#costs)


---

## 1️⃣ Analyse du Code Existant {#analyse}

### ✅ Points Forts
- **Stack moderne** : Next.js 14+, React 18, Supabase
- **Architecture solide** : Séparation components/lib/app
- **Auth** : Context AuthContext déjà implémenté
- **Types** : TypeScript bien utilisé
- **UI** : Radix UI + Tailwind + Sonner pour toasts

### ⚠️ Points d'Amélioration
- Pas de gestion des emojis pour contacts
- Pas de system de notifications push
- Pas de tracking des interactions utilisateurs
- Pas de modal RGPD explicite
- Besoin d'ajouter Web Push API

---

## 2️⃣ Fonctionnalité 1 : Ajout d'Émotions/Emojis {#feature-1}

### Base de données (Supabase)
```sql
-- Ajout colonne emojis dans table contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS emojis JSONB DEFAULT '[]'::jsonb;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS emoji_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Index pour recherche par emoji
CREATE INDEX IF NOT EXISTS idx_contacts_emojis ON contacts USING GIN (emojis);
```

### Composant EmojiPicker
**Fichier**: `components/features/contacts/EmojiPicker.tsx`

### Hook useContactEmojis
**Fichier**: `lib/hooks/useContactEmojis.ts`

### Type définition
```typescript
// lib/types/contact-emotions.ts
export interface ContactEmoji {
  emoji: string;
  label: string;
  category: 'positive' | 'negative' | 'neutral' | 'professional';
  added_at: string;
}

export interface ContactWithEmojis {
  id: string;
  name: string;
  emojis: ContactEmoji[];
  emoji_tags?: string[];
}
```

---

## 3️⃣ Fonctionnalité 2 : Notifications Push Web {#feature-2}

### Service Worker
**Fichier**: `public/sw.js`

### API Route pour subscriptions
**Fichier**: `app/api/push/subscribe/route.ts`

### Supabase Tables
```sql
-- Table pour stocker les push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_push_user_id ON push_subscriptions(user_id);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

### Supabase Edge Function (pour envoi)
**Fichier**: `supabase/functions/send-push-notifications/index.ts`

---

## 4️⃣ Fonctionnalité 3 : Rappels Automatisés {#feature-3}

### Tracking des interactions
```sql
-- Table pour tracker les activités
CREATE TABLE IF NOT EXISTS contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'view', 'call', 'email', 'message'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user_contact ON contact_activities(user_id, contact_id);
CREATE INDEX idx_activities_created_at ON contact_activities(created_at DESC);
```

### Cron Job (Supabase pg_cron)
```sql
-- Extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job hebdomadaire chaque lundi à 9h
SELECT cron.schedule(
  'weekly-forgotten-contacts-reminder',
  '0 9 * * 1', -- Chaque lundi à 9h
  $$
  SELECT send_forgotten_contacts_notifications();
  $$
);

-- Fonction pour détecter contacts oubliés
CREATE OR REPLACE FUNCTION send_forgotten_contacts_notifications()
RETURNS void AS $$
DECLARE
  forgotten_contact RECORD;
BEGIN
  FOR forgotten_contact IN
    SELECT DISTINCT 
      c.user_id,
      c.id as contact_id,
      c.name,
      MAX(ca.created_at) as last_activity
    FROM contacts c
    LEFT JOIN contact_activities ca ON ca.contact_id = c.id
    WHERE ca.created_at < NOW() - INTERVAL '7 days'
      OR ca.created_at IS NULL
    GROUP BY c.user_id, c.id, c.name
    HAVING MAX(ca.created_at) < NOW() - INTERVAL '7 days' 
      OR MAX(ca.created_at) IS NULL
  LOOP
    -- Envoyer notification via Edge Function
    PERFORM push_notification(
      forgotten_contact.user_id,
      'Contact oublié',
      'Vous n''avez pas contacté ' || forgotten_contact.name || ' depuis 7 jours'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 5️⃣ Fonctionnalité 4 : Consentement RGPD {#feature-4}

### Table Consents
```sql
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'data_storage', 'push_notifications', 'analytics'
  consent_given BOOLEAN DEFAULT FALSE,
  consent_version TEXT DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_consent_type ON user_consents(user_id, consent_type);
```

### Modal RGPD
**Fichier**: `components/features/consent/RGPDConsentModal.tsx`

---

## 6️⃣ Fonctionnalité 5 : Sécurité {#feature-5}

### Row-Level Security (RLS)
```sql
-- Activer RLS sur toutes les tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Policies pour contacts
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);
```

### Validation Zod
**Fichier**: `lib/validation/contact-schemas.ts`

---

## 7️⃣ Tests {#tests}

### Tests unitaires (Jest)
**Fichier**: `tests/unit/emoji-picker.test.ts`

### Tests E2E (Cypress)
**Fichier**: `tests/e2e/contact-flow.cy.ts`

---

## 8️⃣ Coûts & Déploiement {#costs}

### Low-Cost Strategy
- **Supabase** : Free tier (500MB DB, 1GB Storage, 2GB Bandwidth)
- **Vercel** : Free tier (Hobby)
- **Web Push API** : Gratuit (natif navigateur)
- **pg_cron** : Gratuit (extension PostgreSQL)

### Total : **0€/mois** jusqu'à 50K MAU

### Déploiement
```bash
# 1. Install dependencies
npm install emoji-picker-react web-push

# 2. Apply DB migrations
npm run db:push

# 3. Deploy Edge Functions
npx supabase functions deploy send-push-notifications

# 4. Build & Deploy
npm run build
vercel --prod
```
