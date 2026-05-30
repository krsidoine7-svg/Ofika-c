# 🚀 GUIDE DE DÉPLOIEMENT - MODULE PAIEMENTS

## 📋 **PRÉPARATION PRODUCTION**

### **1. Configuration Lygos API**

**Obtenir les clés API :**
1. Créer un compte sur [Lygos](https://lygos.com)
2. Activer les méthodes de paiement :
   - Orange Money
   - MTN Money  
   - Moov Money
   - Wave
3. Récupérer les clés API et webhook secret

**Variables d'environnement production :**
```env
# Lygos API Production
LYGOS_API_KEY=prod_lygos_api_key_here
LYGOS_BASE_URL=https://api.lygos.com
LYGOS_WEBHOOK_SECRET=prod_webhook_secret_here

# Application
NEXT_PUBLIC_APP_URL=https://ofika.app

# Email (pour les confirmations)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@ofika.app
```

### **2. Configuration Base de Données**

**Exécuter en production :**
```sql
-- 1. Créer les tables
-- Exécuter scripts/setup-payment-database.sql

-- 2. Vérifier les contraintes
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- 3. Tester les fonctions
SELECT get_user_order_stats('user-uuid-here');
```

### **3. Configuration Webhooks**

**URL webhook à configurer dans Lygos :**
```
https://ofika.app/api/webhooks/lygos
```

**Headers requis :**
```
Content-Type: application/json
X-Lygos-Signature: [signature]
```

**Événements à écouter :**
- `payment.success`
- `payment.failed`
- `payment.cancelled`

### **4. Tests de Production**

**Checklist de tests :**
- [ ] Création de commande
- [ ] Génération lien de paiement
- [ ] Redirection vers Lygos
- [ ] Webhook de confirmation
- [ ] Mise à jour statut commande
- [ ] Email de confirmation
- [ ] Limite 2 cartes par utilisateur

## 🔧 **MONITORING & MAINTENANCE**

### **Métriques à surveiller :**
- Taux de conversion des paiements
- Temps de réponse des webhooks
- Erreurs de paiement
- Commandes en attente

### **Logs importants :**
```bash
# Webhooks Lygos
grep "Webhook Lygos" /var/log/app.log

# Erreurs de paiement
grep "Payment error" /var/log/app.log

# Commandes créées
grep "Order created" /var/log/app.log
```

### **Maintenance régulière :**
```sql
-- Nettoyer les commandes expirées (cron job)
SELECT cleanup_expired_orders();

-- Statistiques quotidiennes
SELECT * FROM order_stats;
```

## 🚨 **GESTION D'ERREURS**

### **Erreurs courantes :**

**1. Webhook non reçu :**
- Vérifier l'URL webhook dans Lygos
- Contrôler les logs du serveur
- Tester manuellement l'endpoint

**2. Paiement non confirmé :**
- Vérifier la signature du webhook
- Contrôler les logs de l'API Lygos
- Relancer manuellement si nécessaire

**3. Limite utilisateur dépassée :**
- Vérifier la fonction `check_user_card_limit()`
- Contrôler les données utilisateur
- Réinitialiser si nécessaire

### **Procédures de récupération :**

**Commande bloquée en "pending" :**
```sql
-- Vérifier l'état
SELECT * FROM orders WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';

-- Marquer comme échouée si nécessaire
UPDATE orders 
SET status = 'failed', updated_at = NOW() 
WHERE id = 'order-id' AND status = 'pending';
```

## 📊 **ANALYTICS & REPORTING**

### **Tableaux de bord :**
- Commandes par jour/semaine/mois
- Revenus par méthode de paiement
- Taux de conversion
- Commandes en attente

### **Rapports automatiques :**
```sql
-- Rapport quotidien
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
  SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as revenue
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

## 🔒 **SÉCURITÉ**

### **Bonnes pratiques :**
- [ ] Validation des signatures webhook
- [ ] Rate limiting sur les endpoints
- [ ] Chiffrement des données sensibles
- [ ] Logs d'audit
- [ ] Monitoring des tentatives d'intrusion

### **Audit de sécurité :**
```sql
-- Vérifier les accès non autorisés
SELECT * FROM orders 
WHERE user_id NOT IN (SELECT id FROM auth.users)
LIMIT 10;

-- Vérifier les commandes suspectes
SELECT * FROM orders 
WHERE total_price > 50000 -- Plus de 50,000 XOF
ORDER BY created_at DESC;
```

## 📞 **SUPPORT CLIENT**

### **Problèmes courants :**

**"Je ne peux pas commander" :**
- Vérifier la limite de 2 cartes
- Contrôler le statut du compte
- Vérifier les méthodes de paiement

**"Mon paiement n'est pas confirmé" :**
- Vérifier le statut dans Lygos
- Contrôler les logs de webhook
- Relancer manuellement si nécessaire

**"Je n'ai pas reçu ma carte" :**
- Vérifier l'adresse de livraison
- Contrôler le statut de production
- Contacter le service client

### **Outils de diagnostic :**
```sql
-- Diagnostic utilisateur
SELECT 
  u.email,
  COUNT(o.id) as total_orders,
  COUNT(CASE WHEN o.status = 'paid' THEN 1 END) as paid_orders,
  o.can_order_more
FROM auth.users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.email, o.can_order_more;
```
