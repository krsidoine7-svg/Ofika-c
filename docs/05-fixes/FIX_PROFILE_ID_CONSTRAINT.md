# 🔧 Correction de la Contrainte profile_id

## 🚨 Problème Identifié

**Erreur :** `null value in column "profile_id" of relation "orders" violates not-null constraint`

**Cause :** La table `orders` a une contrainte `NOT NULL` sur la colonne `profile_id`, mais le code essaie d'insérer des valeurs `null` ou `undefined`.

## 🎯 Solution

### Étape 1 : Appliquer les Migrations de Base de Données

Exécutez les migrations SQL dans l'ordre suivant :

```sql
-- 1. Ajouter la colonne profile_id (si elle n'existe pas)
-- Fichier: database/08-fixes/add-profile-id-to-orders.sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

COMMENT ON COLUMN orders.profile_id IS 'Référence vers le profil NFC associé à cette commande';

CREATE INDEX IF NOT EXISTS idx_orders_profile_id 
ON orders (profile_id);
```

```sql
-- 2. Corriger les données existantes et ajouter la contrainte
-- Fichier: database/08-fixes/fix-orders-profile-id-constraint.sql
-- Mettre à jour les commandes sans profile_id
UPDATE orders 
SET profile_id = (
    SELECT p.id 
    FROM profiles p 
    WHERE p.user_id = orders.user_id 
    ORDER BY p.created_at ASC 
    LIMIT 1
)
WHERE profile_id IS NULL;

-- Ajouter la contrainte NOT NULL
ALTER TABLE orders 
ALTER COLUMN profile_id SET NOT NULL;
```

### Étape 2 : Exécuter le Script de Correction Automatique

```bash
# Exécuter le script de correction
node scripts/fix-profile-id-constraint.js
```

### Étape 3 : Vérifier les Modifications du Code

Les fichiers suivants ont été modifiés pour corriger le problème :

#### `lib/types/payments.ts`
```typescript
export interface CreateOrderData {
  shipping_address: ShippingAddress
  profile_id: string  // ✅ Rendu obligatoire (était optionnel)
  card_type: 'nfc_qr' | 'qr_only'
  quantity?: number
}

export interface Order {
  id: string
  user_id: string
  profile_id: string  // ✅ Rendu obligatoire (était optionnel)
  // ... autres champs
}
```

#### `lib/services/payments.ts`
```typescript
export async function createOrder(orderData: CreateOrderData): Promise<{ success: boolean; data?: Order; error?: string }> {
  // ... validation utilisateur ...

  // ✅ Validation obligatoire du profile_id
  if (!orderData.profile_id) {
    return { success: false, error: 'profile_id est obligatoire pour créer une commande' }
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      profile_id: orderData.profile_id,  // ✅ Maintenant garanti d'être non-null
      // ... autres champs
    })
    // ...
}
```

## 🔍 Vérification

### 1. Vérifier la Structure de la Table

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'profile_id'
AND table_schema = 'public';
```

**Résultat attendu :**
- `column_name`: `profile_id`
- `data_type`: `uuid`
- `is_nullable`: `NO` (contrainte NOT NULL active)
- `column_default`: `NULL`

### 2. Vérifier les Contraintes de Clé Étrangère

```sql
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'orders'
AND kcu.column_name = 'profile_id';
```

### 3. Tester la Création d'une Commande

```typescript
// Test de création d'une commande avec profile_id
const orderData: CreateOrderData = {
  shipping_address: {
    name: "Test User",
    email: "test@example.com",
    phone: "+221123456789",
    address: "123 Test Street",
    city: "Dakar"
  },
  profile_id: "uuid-du-profil", // ✅ Obligatoire
  card_type: "nfc_qr",
  quantity: 1
}

const result = await createOrder(orderData)
// Devrait maintenant fonctionner sans erreur
```

## 🎯 Logique Métier

Selon la mémoire du système, la logique cohérente est :

**ÉTAPES SÉQUENTIELLES OBLIGATOIRES :**
1. **PROFIL** → 2. **CARTE NUMÉRIQUE** → 3. **COMMANDE PHYSIQUE**
   (profiles)     (nfc_profiles)      (orders)

**RÈGLES MÉTIER :**
- ÉTAPE 1 : L'utilisateur DOIT avoir au moins 1 profil
- ÉTAPE 2 : L'utilisateur DOIT créer sa carte numérique (design + lien)
- ÉTAPE 3 : L'utilisateur PEUT commander une version physique (DOIT avoir une carte numérique active)

**RELATIONS BASE DE DONNÉES :**
- ✅ `profile_id` dans `orders` (ajouté)
- ✅ Contrainte `NOT NULL` sur `profile_id` (ajoutée)
- ✅ Index sur `profile_id` pour les performances (ajouté)

## 🚀 Prochaines Étapes

1. **Tester le flow complet** : Profil → Carte NFC → Commande
2. **Vérifier l'UI** : S'assurer que `profile_id` est toujours fourni
3. **Mettre à jour les composants** : `CardOrderingFlow` doit sélectionner un profil NFC
4. **Tests d'intégration** : Vérifier que les webhooks fonctionnent avec `profile_id`

## 📝 Notes Importantes

- **Migration des données** : Les commandes existantes sans `profile_id` sont automatiquement mises à jour avec le premier profil de l'utilisateur
- **Validation côté client** : Le code TypeScript valide maintenant que `profile_id` est fourni
- **Performance** : Un index a été ajouté sur `profile_id` pour optimiser les requêtes
- **Cohérence** : Cette correction aligne le code avec la logique métier définie dans la mémoire du système
