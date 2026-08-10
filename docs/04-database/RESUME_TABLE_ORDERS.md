# 📊 RÉSUMÉ EXÉCUTIF - Table ORDERS

## 🎯 Réponse à votre question

**Question** : _"Quelle est la table de ma base de données pour les commandes avec les différents champs ? Je veux voir la cohérence avec les éléments envoyés dans le web lors de la création d'une commande."_

**Réponse courte** : ✅ **La table `orders` est parfaitement cohérente avec le formulaire web.**

---

## 📋 Table concernée

### Nom de la table
**`orders`** (commandes)

### Localisation dans le code
- **Schéma principal** : `drizzle/migrations/0000_black_drax.sql` (lignes 120-144)
- **API de création** : `app/api/orders/create/route.ts`
- **Formulaire web** : `app/dashboard/orders/new/page.tsx`

---

## 🔍 Champs de la table `orders`

### Champs principaux (22 colonnes)

| # | Nom du champ | Type | Requis | Valeur par défaut | Source |
|---|--------------|------|--------|-------------------|--------|
| 1 | `id` | TEXT | ✅ | UUID auto | Auto-généré |
| 2 | `user_id` | TEXT | ✅ | - | Session utilisateur |
| 3 | `order_number` | VARCHAR(20) | ✅ | - | Généré (ORD-timestamp-random) |
| 4 | `status` | VARCHAR(20) | ✅ | 'pending' | Fixé par l'API |
| 5 | `quantity` | INTEGER | ✅ | - | **Formulaire web** |
| 6 | `unit_price` | NUMERIC(10,2) | ✅ | - | Calculé selon card_type |
| 7 | `total_amount` | NUMERIC(10,2) | ✅ | - | Calculé (unit_price × quantity) |
| 8 | `currency` | VARCHAR(3) | ✅ | 'XOF' | Fixé à XOF (Franc CFA) |
| 9 | `card_type` | VARCHAR(50) | ❌ | - | **Formulaire web** |
| 10 | `payment_method` | VARCHAR(20) | ✅ | - | **Formulaire web** |
| 11 | `payment_status` | VARCHAR(20) | ✅ | 'pending' | Fixé par l'API |
| 12 | `payment_reference` | VARCHAR(100) | ❌ | - | Webhook paiement |
| 13 | `shipping_address` | **JSONB** | ✅ | - | **Formulaire web (6 champs)** |
| 14 | `tracking_number` | VARCHAR(100) | ❌ | - | Ajouté lors de l'expédition |
| 15 | `estimated_delivery` | DATE | ❌ | - | Calculé après validation |
| 16 | `actual_delivery` | DATE | ❌ | - | Rempli à la livraison |
| 19 | `wave_payment_id` | TEXT | ❌ | - | Webhook Wave |
| 20 | `wave_payment_url` | TEXT | ❌ | - | API Wave |
| 21 | `created_at` | TIMESTAMP | ✅ | now() | Auto-généré |
| 22 | `updated_at` | TIMESTAMP | ✅ | now() | Auto-généré |

---

## 🌐 Données envoyées depuis le formulaire web

### Champs envoyés (4 champs principaux)

```json
{
  "card_type": "nfc_qr",
  "quantity": 1,
  "payment_method": "Wave",
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

### Détail du champ `shipping_address` (JSONB)

Ce champ contient **6 sous-champs** :

1. **`name`** : Nom complet du destinataire
2. **`email`** : Email du destinataire
3. **`phone`** : Numéro de téléphone
4. **`address`** : Adresse complète de livraison
5. **`city`** : Ville
6. **`postalCode`** : Code postal (optionnel)

---

## ✅ Analyse de cohérence

### Champs du formulaire → Base de données

| Formulaire Web | → | Table `orders` | Cohérence |
|----------------|---|----------------|-----------|
| `card_type` | → | `card_type` | ✅ 100% |
| `quantity` | → | `quantity` | ✅ 100% |
| `payment_method` | → | `payment_method` | ✅ 100% |
| `shipping_address.name` | → | `shipping_address` (JSONB) | ✅ 100% |
| `shipping_address.email` | → | `shipping_address` (JSONB) | ✅ 100% |
| `shipping_address.phone` | → | `shipping_address` (JSONB) | ✅ 100% |
| `shipping_address.address` | → | `shipping_address` (JSONB) | ✅ 100% |
| `shipping_address.city` | → | `shipping_address` (JSONB) | ✅ 100% |
| `shipping_address.postalCode` | → | `shipping_address` (JSONB) | ✅ 100% |

**Résultat** : ✅ **Cohérence parfaite à 100%**

---

## 🔧 Champs générés automatiquement

Ces champs ne sont **PAS** envoyés depuis le formulaire, mais sont **calculés ou générés** par l'API :

| Champ | Comment il est rempli |
|-------|----------------------|
| `id` | UUID généré automatiquement |
| `user_id` | Récupéré depuis la session Supabase |
| `order_number` | Généré avec format `ORD-{timestamp}-{random}` |
| `unit_price` | Calculé selon `CARD_PRICING[card_type]` (15000 XOF) |
| `total_amount` | Calculé : `unit_price × quantity` |
| `currency` | Fixé à `'XOF'` (Franc CFA) |
| `status` | Fixé à `'pending'` |
| `payment_status` | Fixé à `'pending'` |
| `created_at` | Timestamp actuel |
| `updated_at` | Timestamp actuel |

---

## 🔒 Sécurité et validations

### Validations côté client (JavaScript)
- Nom : minimum 2 caractères
- Email : format valide requis
- Téléphone : minimum 8 caractères
- Adresse : minimum 2 caractères
- Ville : minimum 2 caractères

### Validations côté serveur (Zod)
- `card_type` : enum strict (`'nfc_qr' | 'qr_only' | 'premium_subscription' | 'custom'`)
- `quantity` : entier entre 1 et 2
- `payment_method` : enum strict (`'Wave' | 'wave' | 'orange_money' | 'mtn_money'`)
- `shipping_address` : validation stricte de chaque sous-champ

### Protections supplémentaires
- ✅ **Rate Limiting** : 5 requêtes par minute par IP
- ✅ **Authentification** : Session Supabase obligatoire
- ✅ **Prix sécurisés** : Calculés côté serveur (non modifiables par le client)
- ✅ **Limites utilisateur** : Maximum 2 commandes par utilisateur

---

## 📊 Exemple complet de création de commande

### 1. Utilisateur remplit le formulaire

```
Nom : Jean Kouassi
Email : jean.kouassi@example.com
Téléphone : +225 07 12 34 56 78
Adresse : Cocody, Riviera 3, Rue des Jardins
Ville : Abidjan
Code Postal : BP 1234
Type de carte : NFC + QR Code (nfc_qr)
Quantité : 1
Méthode de paiement : Mobile Money (Wave)
```

### 2. Données envoyées à l'API

```json
POST /api/orders/create
{
  "card_type": "nfc_qr",
  "quantity": 1,
  "payment_method": "Wave",
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

### 3. Ligne insérée dans la table `orders`

```sql
INSERT INTO orders VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- id (auto)
  'user-uuid-here',                         -- user_id (session)
  'ORD-1733328000000-ABC123',              -- order_number (généré)
  'pending',                                -- status
  1,                                        -- quantity
  15000.00,                                 -- unit_price (calculé)
  15000.00,                                 -- total_amount (calculé)
  'XOF',                                    -- currency
  'nfc_qr',                                 -- card_type
  'Wave',                                  -- payment_method
  'pending',                                -- payment_status
  NULL,                                     -- payment_reference
  '{"name":"Jean Kouassi","email":"jean.kouassi@example.com","phone":"+225 07 12 34 56 78","address":"Cocody, Riviera 3, Rue des Jardins","city":"Abidjan","postalCode":"BP 1234"}',  -- shipping_address (JSONB)
  NULL,                                     -- tracking_number
  NULL,                                     -- estimated_delivery
  NULL,                                     -- actual_delivery
  NULL,                                     -- wave_payment_id
  NULL,                                     -- wave_payment_url
  '2025-12-04 15:00:00+00',                -- created_at
  '2025-12-04 15:00:00+00'                 -- updated_at
);
```

---

## 🎯 Conclusion

### ✅ Points forts

1. **Cohérence parfaite** : Tous les champs du formulaire sont correctement mappés
2. **Sécurité renforcée** : Validations strictes côté client et serveur
3. **Prix protégés** : Calculs côté serveur uniquement
4. **Format flexible** : JSONB pour `shipping_address` permet l'évolution
5. **Traçabilité** : Timestamps automatiques et numéros de commande uniques

### 📈 Champs à remplir ultérieurement

Ces champs sont remplis par d'autres processus (webhooks, expédition, etc.) :

- `payment_reference` : Après confirmation du paiement
- `tracking_number` : Lors de l'expédition
- `estimated_delivery` : Calculé après validation
- `actual_delivery` : À la livraison
- `wave_payment_id` / `wave_payment_url` : Par le webhook Wave

### 🚀 Recommandations

1. ✅ **Aucune modification nécessaire** : La structure actuelle est optimale
2. 💡 **Amélioration possible** : Ajouter un index sur `payment_status` pour les requêtes fréquentes
3. 💡 **Amélioration possible** : Ajouter une contrainte CHECK sur `status` pour limiter les valeurs

---

## 📚 Documents de référence

Pour plus de détails, consultez :

1. **`STRUCTURE_TABLE_ORDERS.md`** : Documentation complète de la table
2. **`COMPARAISON_FORMULAIRE_DB.md`** : Comparaison détaillée formulaire ↔ DB
3. **Schéma visuel** : Diagramme de la table (image générée)

---

**Date de création** : 2025-12-04  
**Version** : 1.0  
**Statut** : ✅ Validé et cohérent
