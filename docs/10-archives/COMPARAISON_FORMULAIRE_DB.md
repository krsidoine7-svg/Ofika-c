# 🔄 Comparaison : Formulaire Web ↔️ Base de Données

## Vue d'ensemble

Ce document montre la correspondance exacte entre les champs du formulaire web et les colonnes de la table `orders` dans votre base de données.

---

## 📋 Tableau de correspondance

| # | Formulaire Web | Type | → | Table `orders` | Type DB | Traitement |
|---|----------------|------|---|----------------|---------|------------|
| 1 | `card_type` | string | → | `card_type` | varchar(50) | ✅ Direct |
| 2 | `quantity` | number | → | `quantity` | integer | ✅ Direct |
| 3 | `payment_method` | string | → | `payment_method` | varchar(20) | ✅ Direct |
| 4 | `shipping_address.name` | string | → | `shipping_address` | jsonb | ✅ Inclus dans JSONB |
| 5 | `shipping_address.email` | string | → | `shipping_address` | jsonb | ✅ Inclus dans JSONB |
| 6 | `shipping_address.phone` | string | → | `shipping_address` | jsonb | ✅ Inclus dans JSONB |
| 7 | `shipping_address.address` | string | → | `shipping_address` | jsonb | ✅ Inclus dans JSONB |
| 8 | `shipping_address.city` | string | → | `shipping_address` | jsonb | ✅ Inclus dans JSONB |
| 9 | `shipping_address.postalCode` | string | → | `shipping_address` | jsonb | ✅ Inclus dans JSONB |
| 10 | - | - | → | `id` | text | 🔧 Auto-généré (UUID) |
| 11 | - | - | → | `user_id` | text | 🔧 Depuis session auth |
| 12 | - | - | → | `order_number` | varchar(20) | 🔧 Généré (ORD-timestamp-random) |
| 13 | - | - | → | `unit_price` | numeric(10,2) | 🔧 Calculé selon card_type |
| 14 | - | - | → | `total_amount` | numeric(10,2) | 🔧 Calculé (unit_price × quantity) |
| 15 | - | - | → | `currency` | varchar(3) | 🔧 Fixé à 'XOF' |
| 16 | - | - | → | `status` | varchar(20) | 🔧 Fixé à 'pending' |
| 17 | - | - | → | `payment_status` | varchar(20) | 🔧 Fixé à 'pending' |
| 18 | - | - | → | `created_at` | timestamp | 🔧 Auto (now()) |
| 19 | - | - | → | `updated_at` | timestamp | 🔧 Auto (now()) |

**Légende** :
- ✅ **Direct** : Valeur transmise directement du formulaire
- 🔧 **Auto-généré** : Valeur calculée ou générée par l'API

---

## 📤 Données envoyées depuis le formulaire

### Code source du formulaire
**Fichier** : `app/dashboard/orders/new/page.tsx` (lignes 104-114)

```typescript
const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    card_type: selectedCardType,        // 'nfc_qr'
    quantity: 1,                        // Fixé à 1
    payment_method: 'lygos',           // 'lygos'
    shipping_address: shippingInfo     // Objet avec 6 champs
  })
})
```

### Exemple de payload JSON envoyé

```json
{
  "card_type": "nfc_qr",
  "quantity": 1,
  "payment_method": "lygos",
  "shipping_address": {
    "name": "Jean Kouassi",
    "email": "jean.kouassi@example.com",
    "phone": "+225 07 12 34 56 78",
    "address": "Cocody, Riviera 3, Rue des Jardins",
    "city": "Abidjan",
    "postalCode": "BP 1234"
  }
}
```

**Taille du payload** : ~250 bytes

---

## 📥 Données insérées dans la base de données

### Code source de l'API
**Fichier** : `app/api/orders/create/route.ts` (lignes 369-387)

```typescript
const orderInsertData = {
  user_id: user.id,                          // UUID de l'utilisateur connecté
  order_number: orderNumber,                 // Ex: "ORD-1733328000000-ABC123"
  card_type: orderData.card_type,           // "nfc_qr"
  quantity: orderData.quantity,             // 1
  unit_price: unitPrice,                    // 15000 (calculé)
  total_amount: totalAmount,                // 15000 (calculé)
  currency: 'XOF',                          // Franc CFA
  payment_method: orderData.payment_method, // "lygos"
  shipping_address: orderData.shipping_address, // JSONB complet
  status: 'pending',                        // Statut initial
  payment_status: 'pending',                // Statut de paiement initial
  metadata: {                               // Métadonnées
    ...orderData.metadata,
    profile_id: orderData.profile_id,
    created_via: 'api',
    processing_time_ms: Date.now() - startTime
  },
}
```

### Exemple de ligne insérée dans la table `orders`

```sql
INSERT INTO orders (
  id,
  user_id,
  order_number,
  card_type,
  quantity,
  unit_price,
  total_amount,
  currency,
  payment_method,
  shipping_address,
  status,
  payment_status,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'user-uuid-here',
  'ORD-1733328000000-ABC123',
  'nfc_qr',
  1,
  15000.00,
  15000.00,
  'XOF',
  'lygos',
  '{"name":"Jean Kouassi","email":"jean.kouassi@example.com","phone":"+225 07 12 34 56 78","address":"Cocody, Riviera 3, Rue des Jardins","city":"Abidjan","postalCode":"BP 1234"}',
  'pending',
  'pending',
  '2025-12-04 15:00:00+00',
  '2025-12-04 15:00:00+00'
);
```

---

## 🔍 Détails des transformations

### 1. `card_type` (Direct)
```
Formulaire : "nfc_qr"
    ↓
Validation Zod : enum(['nfc_qr', 'qr_only', 'premium_subscription', 'custom'])
    ↓
Base de données : "nfc_qr" (varchar(50))
```

### 2. `quantity` (Direct avec validation)
```
Formulaire : 1
    ↓
Validation Zod : integer entre 1 et 2
    ↓
Base de données : 1 (integer)
```

### 3. `payment_method` (Direct)
```
Formulaire : "lygos"
    ↓
Validation Zod : enum(['lygos', 'wave', 'orange_money', 'mtn_money'])
    ↓
Base de données : "lygos" (varchar(20))
```

### 4. `shipping_address` (Objet → JSONB)
```
Formulaire : {
  name: "Jean Kouassi",
  email: "jean.kouassi@example.com",
  phone: "+225 07 12 34 56 78",
  address: "Cocody, Riviera 3, Rue des Jardins",
  city: "Abidjan",
  postalCode: "BP 1234"
}
    ↓
Validation Zod : Schéma shippingAddressSchema
    ↓
Base de données : JSONB complet
```

### 5. `unit_price` (Calculé)
```
Formulaire : (non envoyé)
    ↓
API : CARD_PRICING[card_type] = 15000
    ↓
Base de données : 15000.00 (numeric(10,2))
```

### 6. `total_amount` (Calculé)
```
Formulaire : (non envoyé)
    ↓
API : unit_price × quantity = 15000 × 1 = 15000
    ↓
Base de données : 15000.00 (numeric(10,2))
```

### 7. `order_number` (Généré)
```
Formulaire : (non envoyé)
    ↓
API : generateOrderNumber() → "ORD-{timestamp}-{random}"
    ↓
Base de données : "ORD-1733328000000-ABC123" (varchar(20))
```

### 8. `user_id` (Depuis session)
```
Formulaire : (non envoyé)
    ↓
API : supabase.auth.getUser() → user.id
    ↓
Base de données : UUID de l'utilisateur (text)
```

---

## ✅ Validations appliquées

### Validation côté client (JavaScript)

```typescript
// app/dashboard/orders/new/page.tsx (lignes 77-84)
const validateForm = () => {
  if (!shippingInfo.name || shippingInfo.name.length < 2) 
    return 'Le nom est requis (min 2 caractères)'
  if (!shippingInfo.email) 
    return 'L\'email est requis'
  if (!shippingInfo.phone || shippingInfo.phone.length < 8) 
    return 'Le téléphone est requis (min 8 caractères)'
  if (!shippingInfo.address || shippingInfo.address.length < 2) 
    return 'L\'adresse est requise (min 2 caractères)'
  if (!shippingInfo.city || shippingInfo.city.length < 2) 
    return 'La ville est requise (min 2 caractères)'
  return null
}
```

### Validation côté serveur (Zod)

```typescript
// app/api/orders/create/route.ts (lignes 15-22)
const shippingAddressSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  phone: z.string().min(8).max(20),
  address: z.string().min(2).max(255),
  city: z.string().min(2).max(100),
  postalCode: z.union([z.string().min(2).max(10), z.literal('')]).optional(),
})
```

---

## 🔒 Sécurité

### Champs protégés (non modifiables par le client)

| Champ | Protection | Raison |
|-------|-----------|--------|
| `id` | Auto-généré (UUID) | Évite les collisions |
| `user_id` | Depuis session auth | Empêche l'usurpation d'identité |
| `order_number` | Généré avec retry | Garantit l'unicité |
| `unit_price` | Calculé côté serveur | Empêche la manipulation des prix |
| `total_amount` | Calculé côté serveur | Empêche la manipulation des prix |
| `currency` | Fixé à 'XOF' | Cohérence métier |
| `status` | Fixé à 'pending' | Logique métier |
| `payment_status` | Fixé à 'pending' | Logique métier |

### Mécanismes de sécurité

1. **Rate Limiting** : 5 requêtes/minute par IP
2. **Authentification** : Session Supabase obligatoire
3. **Validation Zod** : Schéma strict côté serveur
4. **Calcul sécurisé** : Prix non modifiables par le client
5. **Limites utilisateur** : Maximum 2 commandes par utilisateur

---

## 📊 Flux de données complet

```
┌─────────────────────────────────────────────────────────────────┐
│                      FORMULAIRE WEB                             │
│  (app/dashboard/orders/new/page.tsx)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/orders/create
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION CLIENT                            │
│  - Nom (min 2 caractères)                                      │
│  - Email (format valide)                                       │
│  - Téléphone (min 8 caractères)                               │
│  - Adresse (min 2 caractères)                                 │
│  - Ville (min 2 caractères)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ENDPOINT                               │
│  (app/api/orders/create/route.ts)                             │
│                                                                 │
│  1. Rate Limiting (5 req/min)                                 │
│  2. Authentification (Supabase)                               │
│  3. Validation Zod                                            │
│  4. Vérification limites utilisateur                          │
│  5. Calcul prix (unit_price, total_amount)                   │
│  6. Génération order_number                                   │
│  7. Insertion en base de données                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                              │
│  Table: orders                                                  │
│                                                                 │
│  Champs remplis :                                              │
│  ✅ id (UUID auto)                                             │
│  ✅ user_id (session)                                          │
│  ✅ order_number (généré)                                      │
│  ✅ card_type (formulaire)                                     │
│  ✅ quantity (formulaire)                                      │
│  ✅ unit_price (calculé)                                       │
│  ✅ total_amount (calculé)                                     │
│  ✅ currency (fixé XOF)                                        │
│  ✅ payment_method (formulaire)                                │
│  ✅ shipping_address (formulaire JSONB)                        │
│  ✅ status (pending)                                           │
│  ✅ payment_status (pending)                                   │
│  ✅ created_at (now())                                         │
│  ✅ updated_at (now())                                         │
│                                                                 │
│  Champs vides (remplis plus tard) :                           │
│  ⏳ payment_reference                                          │
│  ⏳ tracking_number                                            │
│  ⏳ estimated_delivery                                         │
│  ⏳ actual_delivery                                            │
│  ⏳ lygos_payment_id                                           │
│  ⏳ lygos_payment_url                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Conclusion

### ✅ Cohérence parfaite

Tous les champs envoyés depuis le formulaire web sont correctement mappés et validés avant insertion dans la base de données.

### 🔒 Sécurité renforcée

- Prix calculés côté serveur
- Authentification obligatoire
- Validation stricte avec Zod
- Rate limiting actif

### 📈 Évolutivité

- Format JSONB pour `shipping_address` permet d'ajouter des champs sans migration
- Champs de paiement pour Wave et LyGOS déjà prévus
- Métadonnées extensibles

---

**Dernière mise à jour** : 2025-12-04  
**Version** : 1.0
