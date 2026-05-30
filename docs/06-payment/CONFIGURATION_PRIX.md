# 💰 Configuration Centralisée des Prix

**Date :** 10 Novembre 2025  
**Objectif :** Centraliser tous les prix dans une seule variable d'environnement

---

## 🎯 Principe

Tous les prix sont maintenant gérés depuis la variable d'environnement :
```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600
```

**Avantage :** Modifier cette valeur met à jour le prix **partout dans l'application** ! 🚀

---

## 📝 Configuration

### 1️⃣ Dans `.env` ou `.env.local`

```bash
# Prix de la carte NFC (en XOF - Franc CFA)
# Modifiez cette valeur pour changer le prix partout dans l'application
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600
```

**Important :** Le préfixe `NEXT_PUBLIC_` rend cette variable accessible côté client ET serveur.

---

### 2️⃣ Dans le code TypeScript

#### Fichier centralisé : `lib/config/pricing.ts`

```typescript
// Prix de base récupéré depuis .env
export const NFC_CARD_BASE_PRICE = parseInt(
  process.env.NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT || '14600'
)

// Obtenir le prix formaté
export function getDisplayPrice(): string {
  return formatPrice(NFC_CARD_BASE_PRICE)  // "14 600 FCFA"
}

// Obtenir le prix brut (nombre)
export function getRawPrice(): number {
  return NFC_CARD_BASE_PRICE  // 14600
}
```

#### Utilisation dans les composants

```typescript
import { getRawPrice } from '@/lib/config/pricing'

function MyComponent() {
  return (
    <span>{getRawPrice().toLocaleString('fr-FR')} XOF</span>
    // Affiche: "14 600 XOF"
  )
}
```

---

### 3️⃣ Dans la base de données (Supabase)

#### Table `pricing_config`

Une table dédiée stocke les prix pour le backend :

```sql
SELECT * FROM pricing_config;

-- Résultat:
-- id      | nfc_card_base_price | premium_supplement | currency
-- default | 14600               | 5000               | XOF
```

#### Mettre à jour le prix dans la BDD

```sql
UPDATE pricing_config 
SET nfc_card_base_price = 14600 
WHERE id = 'default';
```

#### Fonction SQL automatique

```sql
SELECT calculate_nfc_card_price('design-classic', 1, 'CI');

-- Résultat: Lit automatiquement le prix depuis pricing_config
-- {"base_price": 14600, "total": 16600, "currency": "XOF"}
```

---

## 🔄 Comment changer le prix PARTOUT en une fois ?

### Méthode 1 : Via .env (Frontend uniquement)

1. Ouvrir `.env` ou `.env.local`
2. Modifier :
   ```bash
   NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=16000  # Nouveau prix
   ```
3. Redémarrer le serveur :
   ```bash
   npm run dev
   ```

✅ Le prix est mis à jour sur `/get-started` et tous les composants React

---

### Méthode 2 : Via SQL (Backend + Frontend)

1. Ouvrir Supabase SQL Editor
2. Exécuter :
   ```sql
   UPDATE pricing_config 
   SET nfc_card_base_price = 16000 
   WHERE id = 'default';
   ```

✅ Le prix est mis à jour dans les calculs SQL (fonction `calculate_nfc_card_price`)

**⚠️ Important :** Pour synchroniser, mettez aussi à jour `.env` !

---

### Méthode 3 : Synchronisation automatique (Recommandé)

Créer un script qui synchronise `.env` et la BDD :

```typescript
// scripts/sync-pricing.ts
import { createClient } from '@/lib/supabase/server'

async function syncPricing() {
  const price = process.env.NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT
  const supabase = createClient()
  
  await supabase
    .from('pricing_config')
    .update({ nfc_card_base_price: parseInt(price) })
    .eq('id', 'default')
  
  console.log(`✅ Prix synchronisé : ${price} XOF`)
}

syncPricing()
```

Exécuter :
```bash
tsx scripts/sync-pricing.ts
```

---

## 📊 Où le prix est utilisé ?

### Frontend (React)

| Fichier | Utilisation |
|---------|-------------|
| `app/get-started/page.tsx` | Affichage du prix sur la carte NFC |
| `lib/config/pricing.ts` | Configuration centralisée |
| Futurs wizards | Prix dans le récapitulatif |

### Backend (SQL)

| Fonction/Table | Utilisation |
|----------------|-------------|
| `pricing_config` | Table de configuration |
| `calculate_nfc_card_price()` | Calcul du prix total |
| `get_nfc_card_base_price()` | Récupération du prix de base |

---

## 🧮 Exemple de calcul complet

### Configuration actuelle
```bash
# .env
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600
```

```sql
-- pricing_config
nfc_card_base_price: 14600
premium_supplement:  5000
shipping_uemoa:      2000
```

### Calcul pour une carte standard (CI)
```
Prix de base    : 14 600 XOF  (depuis .env)
Livraison       :  2 000 XOF  (depuis pricing_config)
Total           : 16 600 XOF
```

### Calcul pour une carte premium (CI)
```
Prix de base    : 14 600 XOF
Supplément      : + 5 000 XOF
Livraison       :  2 000 XOF
Total           : 21 600 XOF
```

---

## 🔒 Sécurité

### Variables d'environnement

✅ **Publiques** (NEXT_PUBLIC_*) :
- Accessibles côté client
- Visibles dans le code source
- OK pour les prix (info publique)

❌ **Privées** (sans NEXT_PUBLIC_) :
- Uniquement côté serveur
- Utilisez pour les clés API, secrets, etc.

### Table pricing_config

- ✅ **Lecture** : Publique (tout le monde)
- ❌ **Écriture** : Admins uniquement (RLS activé)

---

## 🧪 Tests

### Test Frontend
```bash
# Modifier .env
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=20000

# Redémarrer
npm run dev

# Vérifier sur http://localhost:3000/get-started
# Le prix doit afficher "20 000 XOF"
```

### Test Backend
```sql
-- Changer le prix en BDD
UPDATE pricing_config SET nfc_card_base_price = 20000 WHERE id = 'default';

-- Tester
SELECT calculate_nfc_card_price('design-classic', 1, 'CI');
-- Résultat: {"base_price": 20000, ...}
```

---

## 📌 Checklist de mise à jour des prix

Quand vous voulez changer le prix :

- [ ] Modifier `NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT` dans `.env`
- [ ] Redémarrer le serveur (`npm run dev`)
- [ ] Mettre à jour `pricing_config` dans Supabase (SQL)
- [ ] Vérifier `/get-started` - le nouveau prix s'affiche
- [ ] Tester `calculate_nfc_card_price()` - retourne le bon prix
- [ ] Commit & Push (si nécessaire)

---

## 🚀 Prochaines améliorations

- [ ] Dashboard admin pour modifier les prix en live
- [ ] Historique des changements de prix
- [ ] Prix variables selon l'utilisateur (B2B, B2C)
- [ ] Remises automatiques (quantité, promotions)
- [ ] Multi-devises (XOF, EUR, USD)

---

**Créé le :** 10 Novembre 2025  
**Dernière mise à jour :** 10 Novembre 2025  
**Statut :** ✅ Opérationnel
