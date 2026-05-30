# Documentation API Endpoints

## 📚 Table des matières

- [Onboarding](#onboarding)
- [Orders](#orders)
- [Profiles](#profiles)
- [QR Codes](#qr-codes)
- [NFC Cards](#nfc-cards)
- [Rate Limiting](#rate-limiting)

---

## 🚀 Onboarding

### POST `/api/onboarding/save-temp`

Sauvegarde temporaire des données d'onboarding (utilisateur non authentifié).

**Rate Limit:** 20 requêtes / minute

**Body:**
```json
{
  "session_id": "string (requis)",
  "flow_type": "public_page" | "nfc_card",
  "step": 1,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    ...
  },
  "user_email": "john@example.com" (optionnel)
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "session_id": "string",
    "flow_type": "public_page",
    "current_step": 1,
    "payload": {...},
    "created_at": "2025-01-01T00:00:00Z"
  },
  "message": "Données sauvegardées avec succès"
}
```

**Response Error (400):**
```json
{
  "error": "Données invalides",
  "details": [...]
}
```

---

### GET `/api/onboarding/save-temp?session_id=xxx`

Récupère les données temporaires d'une session.

**Query Params:**
- `session_id` (string, requis)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "string",
    "flow_type": "public_page",
    "current_step": 2,
    "payload": {...}
  }
}
```

---

### POST `/api/onboarding/finalize`

Finalise l'onboarding après authentification (crée le profil ou la carte NFC).

**Rate Limit:** 10 requêtes / minute

**Headers:**
- `Authorization: Bearer <token>` (requis)

**Body:**
```json
{
  "session_id": "string (requis)",
  "flow_type": "public_page" | "nfc_card"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "result": {
    "type": "profile",
    "data": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe",
      "custom_url": "johndoe",
      ...
    }
  },
  "message": "Onboarding finalisé avec succès"
}
```

**Response Error (401):**
```json
{
  "error": "Utilisateur non authentifié"
}
```

**Response Error (404):**
```json
{
  "error": "Session non trouvée"
}
```

---

### DELETE `/api/onboarding/finalize`

Nettoie les sessions expirées (> 7 jours). **Cron job seulement.**

**Headers:**
- `Authorization: Bearer <CRON_SECRET>` (requis)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Sessions expirées nettoyées"
}
```

---

## 🛒 Orders

### POST `/api/orders/create`

Crée une nouvelle commande.

**Rate Limit:** 5 requêtes / minute

**Headers:**
- `Authorization: Bearer <token>` (requis)

**Body:**
```json
{
  "nfc_card_id": "uuid (optionnel)",
  "product_type": "nfc_card" | "premium_subscription" | "custom",
  "quantity": 1,
  "shipping_address": {
    "full_name": "John Doe",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B (optionnel)",
    "city": "Dakar",
    "state": "Dakar (optionnel)",
    "postal_code": "12345",
    "country": "Sénégal",
    "phone": "+221771234567"
  },
  "metadata": {...},
  "promo_code": "WELCOME10 (optionnel)"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "ORD-1234567890-ABC123",
    "total_amount": 15000,
    "currency": "XOF",
    "status": "pending"
  },
  "message": "Commande créée avec succès"
}
```

**Pricing:**
- **NFC Card:** 15,000 FCFA
- **Premium Subscription:** 25,000 FCFA/mois
- **Réductions:**
  - 5+ quantité: -10%
  - 10+ quantité: -15%
  - Code promo WELCOME10: -10%

---

### GET `/api/orders/create?status=pending&limit=50`

Récupère les commandes de l'utilisateur.

**Query Params:**
- `status` (string, optionnel): pending | paid | shipped | delivered | cancelled
- `limit` (number, optionnel, default: 50)

**Headers:**
- `Authorization: Bearer <token>` (requis)

**Response Success (200):**
```json
{
  "success": true,
  "orders": [...],
  "count": 5
}
```

---

## 👤 Profiles

### Limits
- **Réseaux sociaux:** Maximum 4
- **Liens personnalisés:** Maximum 4

*Documentation détaillée à venir...*

---

## 📱 QR Codes

### Limits
- **Maximum par utilisateur:** 7 QR codes

**Rate Limit création:** 10 requêtes / minute

*Documentation détaillée à venir...*

---

## 💳 NFC Cards

*Documentation à venir...*

---

## ⚡ Rate Limiting

Tous les endpoints sont protégés par rate limiting.

### Presets Disponibles

| Preset | Max Requests | Window | Block Duration | Usage |
|--------|-------------|--------|----------------|--------|
| `public` | 100 | 1 min | - | Endpoints publics (lecture) |
| `auth` | 5 | 1 min | 5 min | Authentification |
| `create` | 10 | 1 min | - | Création de ressources |
| `update` | 30 | 1 min | - | Mise à jour |
| `delete` | 10 | 1 min | - | Suppression |
| `sensitive` | 5 | 1 min | 10 min | Paiements, etc. |
| `heavy` | 5 | 5 min | - | Uploads lourds |

### Headers de Response

Tous les endpoints retournent ces headers :

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640995200000
Retry-After: 60 (en cas d'erreur 429)
```

### Response Error (429)

```json
{
  "error": "Trop de requêtes. Veuillez réessayer dans une minute.",
  "resetAt": 1640995200000
}
```

---

## 🔒 Authentication

La plupart des endpoints nécessitent une authentification via Supabase.

**Header requis:**
```
Authorization: Bearer <supabase_jwt_token>
```

**Obtenir le token:**
```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

---

## 🧪 Validation

Tous les endpoints utilisent Zod pour la validation des données.

**Exemple de réponse d'erreur de validation:**
```json
{
  "error": "Données invalides",
  "details": [
    {
      "path": ["email"],
      "message": "Email invalide"
    },
    {
      "path": ["quantity"],
      "message": "Quantité maximale : 100"
    }
  ]
}
```

---

## 📝 Notes

- Tous les montants sont en **XOF (Francs CFA)**
- Les UUIDs doivent être au format standard
- Les URLs doivent inclure le protocole (http:// ou https://)
- Les codes promo sont sensibles à la casse
- Le rate limiting est basé sur l'IP pour les endpoints publics, et sur le user_id pour les endpoints authentifiés

---

## 🚧 À Venir

- Endpoints de Paiement CI
- Webhooks documentation
- OAuth endpoints

---

**Dernière mise à jour:** 2025-01-11
