# 📊 Module Avis Clients - Base de Données

## 📁 Structure des Fichiers

```
database/reviews/
├── 00-FULL-MIGRATION.sql          # ⭐ Script complet (recommandé)
├── 01-create-reviews-tables.sql   # Tables et indexes
├── 02-create-rls-policies.sql     # Row Level Security
├── 03-create-triggers.sql         # Triggers et validations
├── 04-create-storage-bucket.sql   # Bucket Supabase Storage
└── README.md                       # Ce fichier
```

---

## 🚀 Installation Rapide

### Option 1: Migration Complète (Recommandé)

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Créer une nouvelle requête
3. Copier-coller le contenu de `00-FULL-MIGRATION.sql`
4. Cliquer sur **Run**
5. Vérifier les résultats en bas de la page

✅ **C'est tout !** Le script est idempotent, vous pouvez le relancer sans problème.

### Option 2: Installation Progressive

Si vous préférez exécuter étape par étape :

```sql
-- 1. Tables et indexes
\i 01-create-reviews-tables.sql

-- 2. RLS policies
\i 02-create-rls-policies.sql

-- 3. Triggers
\i 03-create-triggers.sql

-- 4. Storage bucket
\i 04-create-storage-bucket.sql
```

---

## 📋 Schéma de Base de Données

### Table: `review_links`

Liens personnalisés pour collecter des avis clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence vers auth.users |
| `title` | TEXT | Nom du lien (visible par les clients) |
| `slug` | TEXT | Slug unique pour l'URL publique |
| `fields_config` | JSONB | Configuration des champs du formulaire |
| `is_active` | BOOLEAN | Statut du lien |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de dernière modification |

**URL publique**: `https://ofika.com/avis/{slug}`

**Configuration des champs** (JSONB):
```json
{
  "name_required": false,
  "email_required": false,
  "comment_required": false,
  "media_enabled": false,
  "purchase_verification": false
}
```

### Table: `reviews`

Avis soumis par les clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `link_id` | UUID | Référence vers review_links |
| `client_name` | TEXT | Nom du client (optionnel) |
| `client_email` | TEXT | Email du client (optionnel) |
| `rating` | INTEGER | Note de 1 à 5 étoiles |
| `comment` | TEXT | Commentaire (optionnel) |
| `has_purchase` | BOOLEAN | A acheté le produit/service |
| `media_url` | TEXT | URL du média (image/vidéo) |
| `media_type` | TEXT | Type: 'image' ou 'video' |
| `ip_address` | INET | IP du client (anti-fraude) |
| `user_agent` | TEXT | User agent (anti-fraude) |
| `fingerprint` | TEXT | Empreinte navigateur (anti-fraude) |
| `is_verified` | BOOLEAN | Avis vérifié |
| `is_public` | BOOLEAN | Visible publiquement |
| `moderation_status` | TEXT | 'pending', 'approved', 'rejected' |
| `moderation_note` | TEXT | Note privée de modération |
| `created_at` | TIMESTAMPTZ | Date de soumission |
| `updated_at` | TIMESTAMPTZ | Date de modification |

---

## 🔒 Sécurité (RLS)

### Politiques `review_links`

- **SELECT**: L'utilisateur ne voit que ses propres liens
- **INSERT**: L'utilisateur ne peut créer que pour lui-même
- **UPDATE**: L'utilisateur ne peut modifier que ses liens
- **DELETE**: L'utilisateur ne peut supprimer que ses liens

### Politiques `reviews`

- **SELECT**: Le propriétaire du lien voit tous les avis associés
- **INSERT**: 🌍 **Public** (formulaire ouvert à tous)
- **UPDATE**: Propriétaire uniquement (pour modération)
- **DELETE**: Propriétaire uniquement

---

## 📦 Storage Bucket: `review-media`

**Bucket configuré pour**:
- Images: JPEG, PNG, GIF, WebP
- Vidéos: MP4, QuickTime, WebM
- Taille max: **10MB** par fichier
- Accès: **Public** (lecture)

**Structure**:
```
review-media/
├── images/
│   └── {uuid}.jpg
├── videos/
│   └── {uuid}.mp4
└── temp/           # Upload temporaires
```

---

## 🔧 Fonctions Utilitaires

### `get_review_link_stats(link_id UUID)`

Retourne les statistiques agrégées d'un lien :

```sql
SELECT * FROM get_review_link_stats('uuid-du-lien');
```

**Retour**:
```
total_reviews     | BIGINT
avg_rating        | NUMERIC (2 décimales)
rating_5_count    | BIGINT
rating_4_count    | BIGINT
rating_3_count    | BIGINT
rating_2_count    | BIGINT
rating_1_count    | BIGINT
positive_rate     | NUMERIC (pourcentage d'avis 4-5 étoiles)
latest_review_at  | TIMESTAMPTZ
```

**Exemple**:
```sql
-- Stats du lien avec slug 'mon-service'
SELECT r.* 
FROM review_links l
JOIN LATERAL get_review_link_stats(l.id) r ON true
WHERE l.slug = 'mon-service';
```

---

## ⚡ Triggers Automatiques

| Trigger | Table | Action |
|---------|-------|--------|
| `trigger_validate_slug` | review_links | Valide le format du slug (INSERT/UPDATE) |
| `trigger_sanitize_review` | reviews | Nettoie les données client (INSERT/UPDATE) |
| `trigger_review_links_updated_at` | review_links | Met à jour `updated_at` (UPDATE) |
| `trigger_reviews_updated_at` | reviews | Met à jour `updated_at` (UPDATE) |

---

## 🔍 Requêtes Utiles

### Lister tous les liens d'un utilisateur avec stats

```sql
SELECT 
  l.*,
  s.total_reviews,
  s.avg_rating,
  s.positive_rate
FROM review_links l
LEFT JOIN LATERAL get_review_link_stats(l.id) s ON true
WHERE l.user_id = auth.uid()
ORDER BY l.created_at DESC;
```

### Avis récents avec filtrage

```sql
SELECT 
  r.*,
  l.title as link_title
FROM reviews r
JOIN review_links l ON l.id = r.link_id
WHERE l.user_id = auth.uid()
  AND r.rating >= 4  -- Avis positifs
  AND r.created_at > NOW() - INTERVAL '7 days'
ORDER BY r.created_at DESC;
```

### Détecter les avis suspects (même IP)

```sql
SELECT 
  ip_address,
  COUNT(*) as review_count,
  array_agg(client_email) as emails
FROM reviews
WHERE link_id = 'uuid-du-lien'
GROUP BY ip_address
HAVING COUNT(*) > 1
ORDER BY review_count DESC;
```

---

## 📊 Indexes Créés

**Optimisés pour**:
- Recherche par utilisateur (`user_id`)
- Recherche par slug (`slug`)
- Filtrage par rating (`rating`)
- Tri par date (`created_at`)
- Détection de doublons (`ip_address`, `fingerprint`)
- Requêtes dashboard (`link_id + rating + created_at`)

**Total**: 13 indexes

---

## ✅ Vérification Post-Installation

```sql
-- Vérifier que tout est créé
SELECT
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'review_links') as review_links_table,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'reviews') as reviews_table,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'review_links') as review_links_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'reviews') as reviews_policies,
  (SELECT COUNT(*) FROM storage.buckets WHERE name = 'review-media') as storage_bucket;
```

**Résultat attendu**:
```
review_links_table   | 1
reviews_table        | 1
review_links_policies| 4
reviews_policies     | 4
storage_bucket       | 1
```

---

## 🧹 Maintenance

### Nettoyer les fichiers orphelins

```sql
-- Voir les fichiers non utilisés
SELECT name, created_at
FROM storage.objects
WHERE bucket_id = 'review-media'
  AND NOT EXISTS (
    SELECT 1 FROM reviews WHERE media_url LIKE '%' || name
  )
  AND created_at < NOW() - INTERVAL '24 hours';
```

### Désactiver un lien

```sql
UPDATE review_links
SET is_active = false
WHERE slug = 'mon-lien';
```

---

## 🔄 Rollback (Désinstallation)

Si vous devez désinstaller le module :

```sql
-- ⚠️ ATTENTION: Ceci supprime TOUTES les données

-- 1. Supprimer les tables (cascade supprime aussi les reviews)
DROP TABLE IF EXISTS review_links CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- 2. Supprimer les fonctions
DROP FUNCTION IF EXISTS validate_review_link_slug CASCADE;
DROP FUNCTION IF EXISTS sanitize_review_data CASCADE;
DROP FUNCTION IF EXISTS get_review_link_stats CASCADE;

-- 3. Supprimer le bucket (via Dashboard Supabase Storage)
-- Ou via SQL:
DELETE FROM storage.buckets WHERE name = 'review-media';
```

---

## 📞 Support

Pour toute question sur la base de données du module Avis Clients :

1. Vérifier les logs Supabase
2. Consulter ce README
3. Voir le plan complet : `/docs/PLAN_INTEGRATION_AVIS_CLIENTS.md`

---

**Créé le**: 2025-12-08  
**Version**: 1.0  
**Module**: Avis Clients Ofika
