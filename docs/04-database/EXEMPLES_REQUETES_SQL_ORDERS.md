# 🔍 Exemples de Requêtes SQL - Table ORDERS

## 📋 Guide pratique pour interroger la table `orders`

Ce document fournit des exemples de requêtes SQL courantes pour travailler avec la table `orders`.

---

## 📊 Requêtes de consultation

### 1. Voir toutes les commandes d'un utilisateur

```sql
SELECT 
  id,
  order_number,
  card_type,
  quantity,
  total_amount,
  currency,
  status,
  payment_status,
  created_at
FROM orders
WHERE user_id = 'votre-user-id-ici'
ORDER BY created_at DESC;
```

### 2. Voir les détails complets d'une commande

```sql
SELECT 
  o.id,
  o.order_number,
  o.card_type,
  o.quantity,
  o.unit_price,
  o.total_amount,
  o.currency,
  o.payment_method,
  o.status,
  o.payment_status,
  o.shipping_address,
  o.tracking_number,
  o.estimated_delivery,
  o.actual_delivery,
  o.created_at,
  o.updated_at,
  u.name as user_name,
  u.email as user_email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.order_number = 'ORD-1733328000000-ABC123';
```

### 3. Extraire les informations de livraison (JSONB)

```sql
SELECT 
  order_number,
  shipping_address->>'name' as recipient_name,
  shipping_address->>'email' as recipient_email,
  shipping_address->>'phone' as recipient_phone,
  shipping_address->>'address' as delivery_address,
  shipping_address->>'city' as city,
  shipping_address->>'postalCode' as postal_code
FROM orders
WHERE user_id = 'votre-user-id-ici';
```

### 4. Filtrer par statut de commande

```sql
-- Commandes en attente
SELECT * FROM orders 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Commandes payées
SELECT * FROM orders 
WHERE payment_status = 'completed' 
ORDER BY created_at DESC;

-- Commandes expédiées
SELECT * FROM orders 
WHERE status = 'shipped' 
ORDER BY created_at DESC;
```

### 5. Rechercher par ville de livraison

```sql
SELECT 
  order_number,
  shipping_address->>'name' as recipient,
  shipping_address->>'city' as city,
  total_amount,
  status
FROM orders
WHERE shipping_address->>'city' ILIKE '%Abidjan%'
ORDER BY created_at DESC;
```

### 6. Statistiques par type de carte

```sql
SELECT 
  card_type,
  COUNT(*) as total_orders,
  SUM(quantity) as total_cards,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY card_type
ORDER BY total_revenue DESC;
```

---

## 📈 Requêtes d'analyse

### 7. Commandes par mois

```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### 8. Taux de conversion des paiements

```sql
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE payment_status = 'completed') as paid_orders,
  COUNT(*) FILTER (WHERE payment_status = 'failed') as failed_orders,
  COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_orders,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE payment_status = 'completed') / COUNT(*),
    2
  ) as conversion_rate_percent
FROM orders;
```

### 9. Méthodes de paiement les plus utilisées

```sql
SELECT 
  payment_method,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM orders
WHERE status != 'cancelled'
GROUP BY payment_method
ORDER BY total_orders DESC;
```

### 10. Délai moyen de livraison

```sql
SELECT 
  AVG(actual_delivery - created_at::date) as avg_delivery_days,
  MIN(actual_delivery - created_at::date) as min_delivery_days,
  MAX(actual_delivery - created_at::date) as max_delivery_days
FROM orders
WHERE actual_delivery IS NOT NULL;
```

---

## 🔄 Requêtes de mise à jour

### 11. Mettre à jour le statut d'une commande

```sql
UPDATE orders
SET 
  status = 'paid',
  payment_status = 'completed',
  payment_reference = 'LYGOS-12345',
  updated_at = NOW()
WHERE order_number = 'ORD-1733328000000-ABC123';
```

### 12. Ajouter un numéro de suivi

```sql
UPDATE orders
SET 
  tracking_number = 'TRACK-123456789',
  status = 'shipped',
  estimated_delivery = CURRENT_DATE + INTERVAL '7 days',
  updated_at = NOW()
WHERE order_number = 'ORD-1733328000000-ABC123';
```

### 13. Marquer une commande comme livrée

```sql
UPDATE orders
SET 
  status = 'delivered',
  actual_delivery = CURRENT_DATE,
  updated_at = NOW()
WHERE order_number = 'ORD-1733328000000-ABC123';
```

### 14. Annuler une commande

```sql
UPDATE orders
SET 
  status = 'cancelled',
  payment_status = 'refunded',
  updated_at = NOW()
WHERE order_number = 'ORD-1733328000000-ABC123'
AND status = 'pending';
```

---

## 🔍 Requêtes de recherche avancées

### 15. Recherche full-text dans les adresses

```sql
SELECT 
  order_number,
  shipping_address->>'name' as recipient,
  shipping_address->>'address' as address,
  total_amount,
  status
FROM orders
WHERE 
  shipping_address->>'address' ILIKE '%Cocody%'
  OR shipping_address->>'city' ILIKE '%Cocody%'
ORDER BY created_at DESC;
```

### 16. Commandes avec paiement LyGOS

```sql
SELECT 
  order_number,
  total_amount,
  lygos_payment_id,
  lygos_payment_url,
  payment_status,
  created_at
FROM orders
WHERE payment_method = 'lygos'
AND lygos_payment_id IS NOT NULL
ORDER BY created_at DESC;
```

### 17. Commandes en retard de livraison

```sql
SELECT 
  order_number,
  shipping_address->>'name' as recipient,
  estimated_delivery,
  status,
  CURRENT_DATE - estimated_delivery as days_late
FROM orders
WHERE 
  estimated_delivery < CURRENT_DATE
  AND status NOT IN ('delivered', 'cancelled')
ORDER BY days_late DESC;
```

### 18. Top 10 des clients par montant dépensé

```sql
SELECT 
  u.name,
  u.email,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_spent,
  AVG(o.total_amount) as avg_order_value
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status != 'cancelled'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC
LIMIT 10;
```

---

## 🛠️ Requêtes d'administration

### 19. Vérifier l'intégrité des données

```sql
-- Vérifier les commandes sans user_id valide
SELECT * FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = o.user_id
);

-- Vérifier les prix incohérents
SELECT * FROM orders
WHERE total_amount != unit_price * quantity;

-- Vérifier les statuts invalides
SELECT * FROM orders
WHERE status NOT IN ('pending', 'paid', 'failed', 'cancelled', 'shipped', 'delivered');
```

### 20. Nettoyer les commandes abandonnées

```sql
-- Voir les commandes en attente depuis plus de 7 jours
SELECT 
  order_number,
  created_at,
  CURRENT_DATE - created_at::date as days_pending
FROM orders
WHERE 
  status = 'pending'
  AND payment_status = 'pending'
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at;

-- Annuler automatiquement (à utiliser avec précaution)
UPDATE orders
SET 
  status = 'cancelled',
  updated_at = NOW()
WHERE 
  status = 'pending'
  AND payment_status = 'pending'
  AND created_at < NOW() - INTERVAL '7 days';
```

---

## 📊 Requêtes pour le dashboard

### 21. Statistiques globales

```sql
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_orders,
  COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
  SUM(total_amount) as total_revenue,
  SUM(total_amount) FILTER (WHERE payment_status = 'completed') as confirmed_revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

### 22. Évolution des commandes (7 derniers jours)

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as orders_count,
  SUM(total_amount) as daily_revenue
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

### 23. Commandes récentes avec détails utilisateur

```sql
SELECT 
  o.order_number,
  o.card_type,
  o.total_amount,
  o.status,
  o.payment_status,
  o.created_at,
  u.name as customer_name,
  u.email as customer_email,
  o.shipping_address->>'city' as delivery_city
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 20;
```

---

## 🔐 Requêtes avec RLS (Row Level Security)

### 24. Tester les politiques RLS

```sql
-- En tant qu'utilisateur authentifié
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims.sub = 'votre-user-id-ici';

-- Cette requête ne devrait retourner que les commandes de l'utilisateur
SELECT * FROM orders;

-- Réinitialiser
RESET role;
```

---

## 💡 Conseils d'optimisation

### Index recommandés

```sql
-- Index déjà créés
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Index supplémentaires recommandés
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_card_type ON orders(card_type);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Index JSONB pour recherche dans shipping_address
CREATE INDEX IF NOT EXISTS idx_orders_shipping_city 
ON orders USING GIN ((shipping_address->>'city'));
```

### Requêtes à éviter

```sql
-- ❌ ÉVITER : Scan complet de la table
SELECT * FROM orders;

-- ✅ PRÉFÉRER : Limiter les résultats
SELECT * FROM orders LIMIT 100;

-- ❌ ÉVITER : Recherche LIKE sans index
SELECT * FROM orders WHERE order_number LIKE '%ABC%';

-- ✅ PRÉFÉRER : Recherche avec index
SELECT * FROM orders WHERE order_number = 'ORD-1733328000000-ABC123';
```

---

## 📚 Ressources

- **Documentation PostgreSQL JSONB** : https://www.postgresql.org/docs/current/datatype-json.html
- **Guide des index PostgreSQL** : https://www.postgresql.org/docs/current/indexes.html
- **RLS (Row Level Security)** : https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

**Date de création** : 2025-12-04  
**Version** : 1.0  
**Base de données** : PostgreSQL (Supabase)
