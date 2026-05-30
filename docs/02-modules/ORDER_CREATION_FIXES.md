# 🔧 CORRECTIONS CRÉATION DE COMMANDE

## 🐛 Problèmes identifiés

### 1. **Erreur "Données invalides"**
**Cause** : Les données envoyées à `/api/orders/create` ne correspondaient pas au schéma de validation.

**Problèmes spécifiques** :
- `profile_id` au lieu de `card_type`
- Champs manquants : `payment_method`
- Structure incorrecte de `shipping_address`
- Champs en trop : `name`, `email`, `address` au lieu de `full_name`, `address_line1`

### 2. **URLs en dur**
**Problème** : `http://localhost:3000` codé en dur dans plusieurs fichiers.

**Impact** : Changement d'URL nécessitait des modifications multiples.

---

## ✅ Solutions appliquées

### 1. **Correction des données de commande**

#### Avant (❌ incorrect)
```javascript
{
  profile_id: '', // ❌ n'existe pas dans le schéma
  card_type: 'nfc_qr',
  quantity: 1,
  shipping_address: {
    name: '', // ❌ devrait être full_name
    email: '', // ❌ pas requis
    phone: '',
    address: '', // ❌ devrait être address_line1
    city: '',
    postal_code: ''
  }
}
```

#### Après (✅ correct)
```javascript
{
  card_type: 'nfc_qr',
  quantity: 1,
  payment_method: 'lygos', // ✅ requis
  shipping_address: {
    full_name: 'Utilisateur Test',
    address_line1: 'Adresse par défaut',
    city: 'Abidjan',
    postal_code: '00225',
    country: 'CI', // ✅ requis
    phone: '+22500000000'
  }
}
```

### 2. **Centralisation des URLs**

#### Nouveau fichier : `lib/config/urls.ts`
```typescript
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  CREATE_ORDER: `${APP_URL}/api/orders/create`,
  LYGOS_CREATE: `${APP_URL}/api/payments/lygos/create`,
  // ... autres endpoints
}
```

### 3. **Mise à jour des composants**

#### Fichiers modifiés :
- ✅ `app/dashboard/orders/new/page.tsx`
- ✅ `components/features/card-ordering/CardOrderingFlow.tsx`
- ✅ `app/test-api/page.tsx`
- ✅ `scripts/test-order-creation.ts`
- ✅ `scripts/test-simple-order.ts`

---

## 🧪 Tests créés

### 1. **Script de test simple**
```bash
npx tsx scripts/test-simple-order.ts
```

### 2. **Script de test complet**
```bash
npx tsx scripts/test-order-creation.ts
```

### 3. **Test d'intégration**
```bash
npx tsx scripts/test-lygos-full-integration.ts
```

---

## 📊 Schéma de validation

### API `/api/orders/create`
```typescript
const orderSchema = z.object({
  card_type: z.enum(['nfc_qr', 'qr_only', 'premium_subscription', 'custom']).optional(),
  quantity: z.number().int().min(1).max(100),
  unit_price: z.number().min(0).optional(),
  payment_method: z.enum(['lygos', 'wave', 'orange_money', 'mtn_money']).default('lygos'),
  shipping_address: z.object({
    full_name: z.string().min(2),
    address_line1: z.string().min(5),
    address_line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().optional(),
    postal_code: z.string().min(2),
    country: z.string().min(2),
    phone: z.string().min(8),
  }),
  metadata: z.record(z.any()).optional(),
})
```

---

## 🎯 Utilisation

### Pour créer une commande
```javascript
import { API_ENDPOINTS } from '@/lib/config/urls'

const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    card_type: 'nfc_qr',
    quantity: 1,
    payment_method: 'lygos',
    shipping_address: {
      full_name: 'John Doe',
      address_line1: '123 Main St',
      city: 'Abidjan',
      postal_code: '00225',
      country: 'CI',
      phone: '+225123456789'
    }
  })
})
```

### Pour changer l'URL de l'application
Il suffit de modifier une seule variable d'environnement :
```bash
NEXT_PUBLIC_APP_URL=https://nouvelle-url.com
```

Toutes les URLs seront automatiquement mises à jour ! 🎉

---

## ✅ Validation

- ✅ Build Next.js réussi
- ✅ TypeScript validé
- ✅ Tests de création de commande fonctionnels
- ✅ URLs centralisées
- ✅ Schéma de validation respecté

**La création de commande est maintenant entièrement fonctionnelle !** 🚀
