# 🔌 API Routes - Module Avis Clients

Documentation complète des endpoints API pour le module de collecte d'avis clients.

---

## 📁 Structure

```
app/api/reviews/
├── create-link/route.ts          # POST: Créer un lien
├── links/route.ts                 # GET: Liste liens user
├── links/[id]/route.ts            # GET, PATCH, DELETE: Gérer un lien
├── submit/route.ts                # POST: Soumettre avis (public)
├── [linkId]/route.ts              # GET: Avis d'un lien
├── [id]/moderate/route.ts         # PATCH, DELETE: Modération
└── export/[linkId]/route.ts       # GET: Export CSV/JSON
```

---

## 🔐 Authentification

- **Routes protégées** : Requièrent un utilisateur authentifié (cookie session Supabase)
- **Routes publiques** : Marquées 🌍, accessibles sans authentification
- **Vérification propriétaire** : Les routes vérifient automatiquement que l'utilisateur est propriétaire de la ressource

---

## 📋 Endpoints

### 1. Créer un lien de collecte

```http
POST /api/reviews/create-link
```

**Auth**: ✅ Requise

**Body**:
```json
{
  "title": "Votre avis sur notre service",
  "fields_config": {
    "name_required": false,
    "email_required": true,
    "comment_required": false,
    "media_enabled": true,
    "purchase_verification": false
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Votre avis sur notre service",
    "slug": "votre-avis-sur-notre-service-a1b2c3",
    "fields_config": { ... },
    "is_active": true,
    "public_url": "https://ofika.com/avis/votre-avis-sur-notre-service-a1b2c3",
    "created_at": "2025-12-08T16:00:00Z",
    "updated_at": "2025-12-08T16:00:00Z"
  }
}
```

**Erreurs**:
- `400`: Données invalides
- `401`: Non authentifié
- `500`: Erreur serveur

---

### 2. Lister mes liens

```http
GET /api/reviews/links?active_only=true
```

**Auth**: ✅ Requise

**Query params**:
- `active_only` (boolean): Si true, ne retourne que les liens actifs

**Response** (200):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "title": "Mon lien",
      "slug": "mon-lien-abc123",
      "is_active": true,
      "created_at": "2025-12-08T16:00:00Z",
      "stats": {
        "total_reviews": 42,
        "avg_rating": 4.5,
        "rating_5_count": 20,
        "rating_4_count": 15,
        "rating_3_count": 5,
        "rating_2_count": 1,
        "rating_1_count": 1,
        "positive_rate": 83.3,
        "latest_review_at": "2025-12-08T15:30:00Z"
      },
      "public_url": "https://ofika.com/avis/mon-lien-abc123"
    }
  ]
}
```

---

### 3. Détails d'un lien

```http
GET /api/reviews/links/:id
```

**Auth**: ✅ Requise (propriétaire uniquement)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mon lien",
    "slug": "mon-lien-abc123",
    "fields_config": { ... },
    "is_active": true,
    "stats": { ... },
    "public_url": "https://ofika.com/avis/mon-lien-abc123",
    "created_at": "2025-12-08T16:00:00Z"
  }
}
```

**Erreurs**:
- `401`: Non authentifié
- `403`: Pas le propriétaire
- `404`: Lien non trouvé

---

### 4. Modifier un lien

```http
PATCH /api/reviews/links/:id
```

**Auth**: ✅ Requise (propriétaire uniquement)

**Body** (tous optionnels):
```json
{
  "title": "Nouveau titre",
  "fields_config": { ... },
  "is_active": false
}
```

**Response** (200):
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 5. Supprimer un lien

```http
DELETE /api/reviews/links/:id
```

**Auth**: ✅ Requise (propriétaire uniquement)

⚠️ **Attention**: Supprime aussi tous les avis associés (cascade)

**Response** (200):
```json
{
  "success": true,
  "message": "Lien \"Mon lien\" supprimé",
  "deleted_reviews_count": 42
}
```

---

### 6. Soumettre un avis (PUBLIC) 🌍

```http
POST /api/reviews/submit
```

**Auth**: ❌ Aucune (public)

**Rate Limiting**: ⚠️ 5 avis par 15 minutes par IP

**Body**:
```json
{
  "link_id": "uuid-du-lien",
  "rating": 5,
  "client_name": "Jean Dupont",
  "client_email": "jean@example.com",
  "comment": "Excellent service, très satisfait !",
  "has_purchase": true,
  "media_url": "https://...",
  "media_type": "image",
  "fingerprint": "hash-navigateur"
}
```

**Champs requis**:
- `link_id` (uuid)
- `rating` (1-5)
- Autres champs selon `fields_config` du lien

**Response** (201):
```json
{
  "success": true,
  "message": "Merci pour votre avis !",
  "data": {
    "id": "uuid",
    "rating": 5,
    "created_at": "2025-12-08T16:00:00Z"
  }
}
```

**Erreurs**:
- `400`: Données invalides / Champs requis manquants
- `404`: Lien non trouvé
- `403`: Lien inactif
- `409`: Avis déjà soumis (duplicate IP ou email)
- `429`: Rate limit dépassé
- `500`: Erreur serveur

**Anti-fraude**:
- ✅ Détection duplicate par IP (24h)
- ✅ Détection duplicate par email
- ✅ Détection duplicate par fingerprint navigateur
- ✅ Rate limiting 5/15min par IP

---

### 7. Récupérer les avis d'un lien

```http
GET /api/reviews/:linkId?rating=5&status=approved&search=excellent&limit=20&offset=0
```

**Auth**: ✅ Requise (propriétaire du lien)

**Query params**:
- `rating` (1-5): Filtrer par note
- `status` (pending|approved|rejected): Filtrer par statut
- `search` (string): Rechercher dans nom, email, commentaire
- `limit` (number, max 100): Nombre de résultats
- `offset` (number): Pagination

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "link_id": "uuid",
      "rating": 5,
      "client_name": "Jean Dupont",
      "client_email": "jean@example.com",
      "comment": "Excellent service !",
      "has_purchase": true,
      "media_url": null,
      "ip_address": "192.168.1.1",
      "moderation_status": "approved",
      "is_verified": false,
      "is_public": true,
      "created_at": "2025-12-08T15:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "filters": {
    "rating": 5,
    "status": "approved",
    "search": "excellent"
  }
}
```

---

### 8. Modérer un avis

```http
PATCH /api/reviews/:id/moderate
```

**Auth**: ✅ Requise (propriétaire du lien associé)

**Body**:
```json
{
  "moderation_status": "approved",
  "moderation_note": "Avis authentique vérifié",
  "is_public": true,
  "is_verified": true
}
```

**Statuts disponibles**:
- `pending`: En attente
- `approved`: Approuvé
- `rejected`: Rejeté

**Response** (200):
```json
{
  "success": true,
  "message": "Avis approuvé",
  "data": { ... }
}
```

---

### 9. Supprimer un avis

```http
DELETE /api/reviews/:id/moderate
```

**Auth**: ✅ Requise (propriétaire du lien associé)

**Response** (200):
```json
{
  "success": true,
  "message": "Avis supprimé"
}
```

---

### 10. Exporter les avis

```http
GET /api/reviews/export/:linkId?format=csv&rating=5&status=approved
```

**Auth**: ✅ Requise (propriétaire du lien)

**Query params**:
- `format` (csv|json): Format de l'export (défaut: csv)
- `rating` (1-5): Filtrer par note
- `status` (pending|approved|rejected): Filtrer par statut

**Response CSV** (200):
```csv
Date,Note,Nom,Email,Commentaire,A acheté,Statut,Vérifié
08/12/2025,5,Jean Dupont,jean@example.com,"Excellent service !",Oui,Approuvé,Oui
```

**Headers**:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="avis-mon-lien-2025-12-08.csv"
```

**Response JSON** (200):
```json
{
  "success": true,
  "link": {
    "id": "uuid",
    "title": "Mon lien"
  },
  "stats": {
    "total": 42,
    "avgRating": "4.50",
    "ratingDistribution": {
      "5": 20,
      "4": 15,
      "3": 5,
      "2": 1,
      "1": 1
    },
    "positiveRate": "83.3",
    "withComment": 38,
    "withPurchase": 30,
    "verified": 25
  },
  "reviews": [ ... ],
  "exported_at": "2025-12-08T16:00:00Z"
}
```

---

## 🔒 Sécurité

### Anti-fraude (route `/submit`)

1. **Rate Limiting**
   - 5 soumissions max par 15 minutes par IP
   - Stockage en mémoire (améliorer avec Redis en production)

2. **Détection doublons**
   - Par IP: Même IP + même lien dans les dernières 24h → Rejet
   - Par email: Même email + même lien (toujours) → Rejet
   - Par fingerprint: Hash navigateur unique

3. **Validation config**
   - Champs requis vérifiés selon `fields_config` du lien
   - Validation format email
   - Nettoyage automatique des données (trim, lowercase)

### Protection RLS

Toutes les routes protégées vérifient:
1. Authentification Supabase
2. Propriété de la ressource (user_id)
3. RLS policies en base de données

---

## 📊 Codes de Réponse HTTP

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Requête invalide (validation échouée) |
| `401` | Non authentifié |
| `403` | Accès refusé (pas le propriétaire) |
| `404` | Ressource non trouvée |
| `409` | Conflit (duplicate) |
| `429` | Rate limit dépassé |
| `500` | Erreur serveur |

---

## 🧪 Tests avec cURL

### Créer un lien
```bash
curl -X POST http://localhost:3000/api/reviews/create-link \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "title": "Avis sur ma pizza",
    "fields_config": {
      "email_required": true,
      "media_enabled": true
    }
  }'
```

### Soumettre un avis (public)
```bash
curl -X POST http://localhost:3000/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "link_id": "uuid-du-lien",
    "rating": 5,
    "client_email": "client@example.com",
    "comment": "Pizza délicieuse !"
  }'
```

### Exporter en CSV
```bash
curl -X GET "http://localhost:3000/api/reviews/export/uuid-du-lien?format=csv" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  --output avis.csv
```

---

## 🚀 Prochaines Étapes

Après avoir testé les API routes:
1. Créer les hooks React Query (`useReviewLinks`, `useReviews`, etc.)
2. Créer les composants UI (tables, formulaires)
3. Créer les pages (dashboard + public)

---

**Créé le**: 2025-12-08  
**Version**: 1.0  
**Module**: Avis Clients Ofika
