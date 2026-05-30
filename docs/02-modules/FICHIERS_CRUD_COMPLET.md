# 📂 Liste Complète des Fichiers CRUD

## 🎯 Vue d'ensemble

Ce document liste **TOUS** les fichiers où les opérations CRUD (Create, Read, Update, Delete) sont implémentées dans votre application Ofika.

---

## 📊 Statistiques

- **Total de fichiers API** : 23 fichiers
- **Opérations CRUD** : 
  - ✅ **CREATE (POST)** : 15 fichiers
  - ✅ **READ (GET)** : 23 fichiers (tous)
  - ✅ **UPDATE (PUT/PATCH)** : 6 fichiers
  - ✅ **DELETE** : 5 fichiers

---

## 1️⃣ USERS (Utilisateurs)

### 📁 `app/api/users/[id]/route.ts`
**Opérations CRUD** : ✅ GET | ✅ PUT | ✅ DELETE

```typescript
// Localisation : app/api/users/[id]/route.ts
// Lignes : 30-120

GET    /api/users/[id]          // Lire un utilisateur
PUT    /api/users/[id]          // Mettre à jour un utilisateur
DELETE /api/users/[id]          // Désactiver un utilisateur (soft delete)
```

**Fonctionnalités** :
- ✅ Lecture des informations utilisateur
- ✅ Mise à jour du profil (nom, email, téléphone, langue)
- ✅ Désactivation de compte (soft delete)
- 🔒 Authentification requise
- 🔒 Vérification des permissions (utilisateur propriétaire ou admin)

### 📁 `app/api/users/change-password/route.ts`
**Opérations CRUD** : ✅ POST

```typescript
POST /api/users/change-password  // Changer le mot de passe
```

**Fonctionnalités** :
- ✅ Changement de mot de passe sécurisé
- 🔒 Authentification requise
- 🔒 Validation du mot de passe actuel

---

## 2️⃣ PROFILES (Profils)

### 📁 `app/api/profiles/route.ts`
**Opérations CRUD** : ✅ POST | ✅ GET

```typescript
// Localisation : app/api/profiles/route.ts
// Lignes : 28-260

POST /api/profiles               // Créer un nouveau profil
GET  /api/profiles               // Lister les profils de l'utilisateur
```

**Fonctionnalités** :
- ✅ Création de profil (professional, personal, event)
- ✅ Liste des profils avec filtres
- ✅ Validation Zod stricte
- 🔒 Authentification requise
- 🔒 RLS (Row Level Security)

### 📁 `app/api/profiles/[id]/route.ts`
**Opérations CRUD** : ✅ GET | ✅ PUT | ✅ DELETE

```typescript
// Localisation : app/api/profiles/[id]/route.ts
// Lignes : 95-390

GET    /api/profiles/[id]       // Lire un profil
PUT    /api/profiles/[id]       // Mettre à jour un profil
DELETE /api/profiles/[id]       // Supprimer un profil
```

**Fonctionnalités** :
- ✅ Lecture de profil (public ou privé)
- ✅ Mise à jour complète (nom, bio, image, réseaux sociaux, liens)
- ✅ Suppression de profil
- ✅ Gestion des liens personnalisés (JSONB)
- ✅ Gestion des réseaux sociaux
- 🔒 Authentification requise pour modification
- 🔒 Profils publics accessibles sans auth

---

## 3️⃣ ORDERS (Commandes)

### 📁 `app/api/orders/create/route.ts`
**Opérations CRUD** : ✅ POST | ✅ GET

```typescript
// Localisation : app/api/orders/create/route.ts
// Lignes : 137-647

POST /api/orders/create          // Créer une commande
GET  /api/orders/create          // Lister les commandes de l'utilisateur
```

**Fonctionnalités** :
- ✅ Création de commande avec validation stricte
- ✅ Calcul automatique des prix
- ✅ Génération de numéro de commande unique
- ✅ Validation de l'adresse de livraison (JSONB)
- ✅ Pagination et filtres pour la liste
- 🔒 Authentification requise
- 🔒 Rate limiting (5 req/min)
- 🔒 Limite de 2 commandes par utilisateur

**Champs gérés** :
- `card_type`, `quantity`, `payment_method`
- `shipping_address` (JSONB : name, email, phone, address, city, postalCode)
- `unit_price`, `total_amount` (calculés)
- `order_number` (généré)

---

## 4️⃣ NFC CARDS (Cartes NFC)

### 📁 `app/api/nfc-cards/route.ts`
**Opérations CRUD** : ✅ POST | ✅ GET

```typescript
POST /api/nfc-cards              // Créer une carte NFC
GET  /api/nfc-cards              // Lister les cartes NFC
```

### 📁 `app/api/nfc-cards/[id]/route.ts`
**Opérations CRUD** : ✅ GET | ✅ PUT | ✅ DELETE

```typescript
// Localisation : app/api/nfc-cards/[id]/route.ts
// Lignes : 104-230

GET    /api/nfc-cards/[id]      // Lire une carte NFC
PUT    /api/nfc-cards/[id]      // Mettre à jour une carte NFC
DELETE /api/nfc-cards/[id]      // Supprimer une carte NFC (soft delete)
```

**Fonctionnalités** :
- ✅ Gestion complète des cartes NFC
- ✅ Association avec profils
- ✅ Gestion du statut (production, livraison)
- ✅ Soft delete (is_activated = false)
- 🔒 Authentification requise

### 📁 `app/api/nfc-cards/[id]/design/route.ts`
**Opérations CRUD** : ✅ PATCH

```typescript
PATCH /api/nfc-cards/[id]/design // Mettre à jour le design
```

### 📁 `app/api/nfc-cards/associate-profile/route.ts`
**Opérations CRUD** : ✅ POST

```typescript
POST /api/nfc-cards/associate-profile // Associer un profil à une carte
```

### 📁 `app/api/nfc-cards/create-profile/route.ts`
**Opérations CRUD** : ✅ POST

```typescript
POST /api/nfc-cards/create-profile    // Créer un profil pour une carte
```

---

## 5️⃣ NOTIFICATIONS

### 📁 `app/api/notifications/route.ts`
**Opérations CRUD** : ✅ POST | ✅ GET

```typescript
// Localisation : app/api/notifications/route.ts
// Lignes : 75-145

POST /api/notifications          // Créer une notification
GET  /api/notifications          // Lister les notifications
```

**Fonctionnalités** :
- ✅ Création de notifications
- ✅ Liste avec filtres (lues/non lues)
- ✅ Pagination
- 🔒 Authentification requise

### 📁 `app/api/notifications/[id]/route.ts`
**Opérations CRUD** : ✅ PUT | ✅ DELETE

```typescript
// Localisation : app/api/notifications/[id]/route.ts
// Lignes : 11-120

PUT    /api/notifications/[id]  // Marquer comme lue
DELETE /api/notifications/[id]  // Supprimer une notification
```

---

## 6️⃣ PAYMENTS (Paiements)

### 📁 `app/api/payments/lygos/create/route.ts`
**Opérations CRUD** : ✅ POST

```typescript
// Localisation : app/api/payments/lygos/create/route.ts
// Lignes : 23-180

POST /api/payments/lygos/create  // Créer un paiement LyGOS
```

**Fonctionnalités** :
- ✅ Création de paiement LyGOS
- ✅ Génération de lien de paiement
- ✅ Validation du montant et de l'order_id
- 🔒 Authentification requise

### 📁 `app/api/payments/lygos/status/route.ts`
**Opérations CRUD** : ✅ GET

```typescript
GET /api/payments/lygos/status   // Vérifier le statut d'un paiement
```

### 📁 `app/api/payments/lygos/webhook/route.ts`
**Opérations CRUD** : ✅ POST

```typescript
// Localisation : app/api/payments/lygos/webhook/route.ts
// Lignes : 19-250

POST /api/payments/lygos/webhook // Recevoir les webhooks LyGOS
```

**Fonctionnalités** :
- ✅ Réception des webhooks de paiement
- ✅ Mise à jour automatique du statut de commande
- ✅ Validation de la signature
- 🔒 Vérification de sécurité

---

## 7️⃣ ONBOARDING

### 📁 `app/api/onboarding/save-temp/route.ts`
**Opérations CRUD** : ✅ POST | ✅ GET

```typescript
// Localisation : app/api/onboarding/save-temp/route.ts
// Lignes : 10-165

POST /api/onboarding/save-temp   // Sauvegarder données temporaires
GET  /api/onboarding/save-temp   // Récupérer données temporaires
```

**Fonctionnalités** :
- ✅ Sauvegarde temporaire pendant l'onboarding
- ✅ Récupération des données par session_id
- 🔒 Rate limiting (10 req/min)

### 📁 `app/api/onboarding/finalize/route.ts`
**Opérations CRUD** : ✅ POST | ✅ DELETE

```typescript
// Localisation : app/api/onboarding/finalize/route.ts
// Lignes : 68-235

POST   /api/onboarding/finalize  // Finaliser l'onboarding
DELETE /api/onboarding/finalize  // Nettoyer les données temporaires
```

**Fonctionnalités** :
- ✅ Création du profil final
- ✅ Nettoyage des données temporaires
- 🔒 Authentification requise

---

## 8️⃣ TEMPLATES

### 📁 `app/api/templates/route.ts`
**Opérations CRUD** : ✅ GET

```typescript
GET /api/templates               // Lister les templates disponibles
```

### 📁 `app/api/templates/[slug]/route.ts`
**Opérations CRUD** : ✅ GET

```typescript
GET /api/templates/[slug]        // Récupérer un template par slug
```

---

## 9️⃣ ANALYTICS

### 📁 `app/api/analytics/link-click/route.ts`
**Opérations CRUD** : ✅ POST

```typescript
// Localisation : app/api/analytics/link-click/route.ts
// Lignes : 17-85

POST /api/analytics/link-click   // Enregistrer un clic sur un lien
```

**Fonctionnalités** :
- ✅ Tracking des clics sur les liens
- ✅ Enregistrement des analytics (IP, user agent, etc.)
- 🔓 Pas d'authentification requise (public)

---

## 🔟 NFC PUBLIC

### 📁 `app/api/nfc/public/[nfcLink]/route.ts`
**Opérations CRUD** : ✅ GET

```typescript
GET /api/nfc/public/[nfcLink]    // Récupérer un profil NFC public
```

**Fonctionnalités** :
- ✅ Accès public aux profils NFC
- ✅ Tracking des vues
- 🔓 Pas d'authentification requise

---

## 1️⃣1️⃣ QR CODE

### 📁 `app/api/qr-code/download/route.ts`
**Opérations CRUD** : ✅ GET

```typescript
GET /api/qr-code/download        // Télécharger un QR code
```

---

## 1️⃣2️⃣ WEBHOOKS

### 📁 `app/api/webhooks/make/route.ts`
**Opérations CRUD** : ✅ POST

```typescript
// Localisation : app/api/webhooks/make/route.ts
// Lignes : 18-85

POST /api/webhooks/make          // Recevoir webhooks Make.com
```

---

## 📊 Tableau récapitulatif par ressource

| Ressource | Fichier(s) | CREATE | READ | UPDATE | DELETE |
|-----------|-----------|--------|------|--------|--------|
| **Users** | `users/[id]/route.ts` | ❌ | ✅ | ✅ | ✅ |
| | `users/change-password/route.ts` | ✅ | ❌ | ❌ | ❌ |
| **Profiles** | `profiles/route.ts` | ✅ | ✅ | ❌ | ❌ |
| | `profiles/[id]/route.ts` | ❌ | ✅ | ✅ | ✅ |
| **Orders** | `orders/create/route.ts` | ✅ | ✅ | ❌ | ❌ |
| **NFC Cards** | `nfc-cards/route.ts` | ✅ | ✅ | ❌ | ❌ |
| | `nfc-cards/[id]/route.ts` | ❌ | ✅ | ✅ | ✅ |
| | `nfc-cards/[id]/design/route.ts` | ❌ | ❌ | ✅ | ❌ |
| | `nfc-cards/associate-profile/route.ts` | ✅ | ❌ | ❌ | ❌ |
| | `nfc-cards/create-profile/route.ts` | ✅ | ❌ | ❌ | ❌ |
| **Notifications** | `notifications/route.ts` | ✅ | ✅ | ❌ | ❌ |
| | `notifications/[id]/route.ts` | ❌ | ❌ | ✅ | ✅ |
| **Payments** | `payments/lygos/create/route.ts` | ✅ | ❌ | ❌ | ❌ |
| | `payments/lygos/status/route.ts` | ❌ | ✅ | ❌ | ❌ |
| | `payments/lygos/webhook/route.ts` | ✅ | ❌ | ❌ | ❌ |
| **Onboarding** | `onboarding/save-temp/route.ts` | ✅ | ✅ | ❌ | ❌ |
| | `onboarding/finalize/route.ts` | ✅ | ❌ | ❌ | ✅ |
| **Templates** | `templates/route.ts` | ❌ | ✅ | ❌ | ❌ |
| | `templates/[slug]/route.ts` | ❌ | ✅ | ❌ | ❌ |
| **Analytics** | `analytics/link-click/route.ts` | ✅ | ❌ | ❌ | ❌ |
| **NFC Public** | `nfc/public/[nfcLink]/route.ts` | ❌ | ✅ | ❌ | ❌ |
| **QR Code** | `qr-code/download/route.ts` | ❌ | ✅ | ❌ | ❌ |
| **Webhooks** | `webhooks/make/route.ts` | ✅ | ❌ | ❌ | ❌ |

---

## 🔐 Fichiers avec authentification requise

### Authentification obligatoire (🔒)
1. `users/[id]/route.ts`
2. `users/change-password/route.ts`
3. `profiles/route.ts`
4. `profiles/[id]/route.ts` (pour modification)
5. `orders/create/route.ts`
6. `nfc-cards/**` (tous)
7. `notifications/**` (tous)
8. `payments/lygos/create/route.ts`
9. `onboarding/finalize/route.ts`

### Accès public (🔓)
1. `nfc/public/[nfcLink]/route.ts`
2. `analytics/link-click/route.ts`
3. `templates/**` (tous)
4. `qr-code/download/route.ts`
5. `profiles/[id]/route.ts` (lecture des profils publics)

---

## 📁 Arborescence complète

```
app/api/
├── analytics/
│   └── link-click/
│       └── route.ts                 ✅ POST (CREATE)
├── nfc/
│   └── public/
│       └── [nfcLink]/
│           └── route.ts             ✅ GET (READ)
├── nfc-cards/
│   ├── route.ts                     ✅ POST, GET (CREATE, READ)
│   ├── [id]/
│   │   ├── route.ts                 ✅ GET, PUT, DELETE (READ, UPDATE, DELETE)
│   │   └── design/
│   │       └── route.ts             ✅ PATCH (UPDATE)
│   ├── associate-profile/
│   │   └── route.ts                 ✅ POST (CREATE)
│   └── create-profile/
│       └── route.ts                 ✅ POST (CREATE)
├── notifications/
│   ├── route.ts                     ✅ POST, GET (CREATE, READ)
│   └── [id]/
│       └── route.ts                 ✅ PUT, DELETE (UPDATE, DELETE)
├── onboarding/
│   ├── save-temp/
│   │   └── route.ts                 ✅ POST, GET (CREATE, READ)
│   └── finalize/
│       └── route.ts                 ✅ POST, DELETE (CREATE, DELETE)
├── orders/
│   └── create/
│       └── route.ts                 ✅ POST, GET (CREATE, READ)
├── payments/
│   └── lygos/
│       ├── create/
│       │   └── route.ts             ✅ POST (CREATE)
│       ├── status/
│       │   └── route.ts             ✅ GET (READ)
│       └── webhook/
│           └── route.ts             ✅ POST (CREATE)
├── profiles/
│   ├── route.ts                     ✅ POST, GET (CREATE, READ)
│   └── [id]/
│       └── route.ts                 ✅ GET, PUT, DELETE (READ, UPDATE, DELETE)
├── qr-code/
│   └── download/
│       └── route.ts                 ✅ GET (READ)
├── templates/
│   ├── route.ts                     ✅ GET (READ)
│   └── [slug]/
│       └── route.ts                 ✅ GET (READ)
├── users/
│   ├── [id]/
│   │   └── route.ts                 ✅ GET, PUT, DELETE (READ, UPDATE, DELETE)
│   └── change-password/
│       └── route.ts                 ✅ POST (CREATE)
└── webhooks/
    └── make/
        └── route.ts                 ✅ POST (CREATE)
```

---

## 🎯 Fichiers les plus importants pour le CRUD

### Top 5 des fichiers CRUD critiques

1. **`app/api/orders/create/route.ts`** ⭐⭐⭐⭐⭐
   - Création et liste des commandes
   - Logique métier complexe
   - Validation stricte
   - 648 lignes de code

2. **`app/api/profiles/[id]/route.ts`** ⭐⭐⭐⭐⭐
   - CRUD complet des profils
   - Gestion des liens et réseaux sociaux
   - 390 lignes de code

3. **`app/api/profiles/route.ts`** ⭐⭐⭐⭐
   - Création de profils
   - Validation Zod
   - 260 lignes de code

4. **`app/api/nfc-cards/[id]/route.ts`** ⭐⭐⭐⭐
   - CRUD complet des cartes NFC
   - Gestion du statut
   - 230 lignes de code

5. **`app/api/users/[id]/route.ts`** ⭐⭐⭐
   - CRUD des utilisateurs
   - Gestion des permissions
   - 120 lignes de code

---

## 📚 Documentation associée

Pour plus de détails sur chaque ressource :

- **Orders** : Voir `STRUCTURE_TABLE_ORDERS.md`, `COMPARAISON_FORMULAIRE_DB.md`
- **Profiles** : Voir `DATABASE_TABLES_DETAIL.md`
- **Payments** : Voir `LYGOS_MIGRATION_COMPLETE_GUIDE.md`
- **API** : Voir `API_ENDPOINTS.md`

---

**Date de création** : 2025-12-04  
**Version** : 1.0  
**Total de fichiers CRUD** : 23 fichiers
