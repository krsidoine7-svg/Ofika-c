# 🚀 Guide de Configuration - Module de Paiement

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la configuration complète du module de paiement Ofika avec l'intégration Lygos pour les paiements mobiles africains.

## ✅ Prérequis

- [x] Projet Next.js configuré
- [x] Base de données Supabase active
- [x] Compte Lygos (pour la production)
- [x] Service d'email (Resend, SendGrid, etc.)

## 🗄️ Étape 1: Configuration de la Base de Données

### 1.1 Exécuter le Script SQL

1. Ouvrez l'éditeur SQL de Supabase
2. Copiez le contenu de `scripts/setup-payment-database-complete.sql`
3. Exécutez le script
4. Vérifiez que les tables sont créées :

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payment_methods', 'webhook_logs');
```

### 1.2 Vérifier les Données

```sql
-- Vérifier les méthodes de paiement
SELECT * FROM payment_methods;

-- Tester la fonction de statistiques
SELECT * FROM get_user_order_stats('00000000-0000-0000-0000-000000000001');
```

## 🔧 Étape 2: Configuration des Variables d'Environnement

### 2.1 Copier le Fichier d'Exemple

```bash
cp env.example.payment .env.local
```

### 2.2 Configurer les Variables

```env
# URL de l'application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# Lygos API (Production)
LYGOS_API_KEY=lygos_live_your_api_key_here
LYGOS_BASE_URL=https://api.lygos.com
LYGOS_WEBHOOK_SECRET=your_webhook_secret_here

# Email (Resend recommandé)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@votre-domaine.com
FROM_NAME=Votre App
SUPPORT_EMAIL=support@votre-domaine.com
```

## 🧪 Étape 3: Tests et Validation

### 3.1 Exécuter les Tests Automatiques

```bash
node scripts/test-payment-flow.js
```

### 3.2 Tests Manuels

1. **Test de Commande :**
   - Allez sur `/dashboard/orders/new`
   - Créez une commande test
   - Vérifiez la redirection vers Lygos

2. **Test de Webhook :**
   - Utilisez la page de simulation
   - Vérifiez que la commande est mise à jour
   - Vérifiez l'envoi d'email

3. **Test du Dashboard :**
   - Consultez `/dashboard/orders`
   - Vérifiez les statistiques
   - Testez la page de détail

## 🌐 Étape 4: Configuration Lygos (Production)

### 4.1 Créer un Compte Lygos

1. Inscrivez-vous sur [Lygos](https://lygos.com)
2. Complétez la vérification KYC
3. Obtenez vos clés API

### 4.2 Configurer les Webhooks

Dans votre dashboard Lygos :

1. **URL de Webhook :** `https://votre-domaine.com/api/webhooks/lygos`
2. **Événements :** `payment.success`, `payment.failed`, `payment.cancelled`
3. **Secret :** Générez un secret fort

### 4.3 Tester en Mode Sandbox

```env
LYGOS_API_KEY=lygos_test_your_sandbox_key
LYGOS_BASE_URL=https://sandbox-api.lygos.com
```

## 📧 Étape 5: Configuration Email

### 5.1 Avec Resend (Recommandé)

```bash
npm install resend
```

```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_your_api_key
```

### 5.2 Avec SendGrid

```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.your_api_key
```

### 5.3 Test des Emails

```bash
# Tester l'envoi d'email
node -e "
const { sendOrderConfirmationEmail } = require('./lib/services/email-notifications');
// Test avec données fictives
"
```

## 🚀 Étape 6: Déploiement

### 6.1 Variables d'Environnement de Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
LYGOS_API_KEY=lygos_live_your_real_key
EMAIL_API_KEY=your_production_email_key
```

### 6.2 Vérifications Post-Déploiement

1. **Webhook Endpoint :**
   ```bash
   curl https://votre-domaine.com/api/webhooks/lygos
   ```

2. **Test de Santé :**
   ```bash
   curl https://votre-domaine.com/api/health
   ```

## 🔍 Étape 7: Monitoring et Logs

### 7.1 Surveiller les Webhooks

```sql
-- Voir les derniers webhooks
SELECT * FROM webhook_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Statistiques des webhooks
SELECT 
  status,
  COUNT(*) as count,
  DATE(created_at) as date
FROM webhook_logs 
GROUP BY status, DATE(created_at)
ORDER BY date DESC;
```

### 7.2 Surveiller les Commandes

```sql
-- Commandes par statut
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status;

-- Revenus par jour
SELECT 
  DATE(created_at) as date,
  SUM(total_price) as revenue,
  COUNT(*) as orders
FROM orders 
WHERE status = 'paid'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🛠️ Dépannage

### Problèmes Courants

1. **Webhook ne fonctionne pas :**
   - Vérifiez l'URL dans Lygos
   - Vérifiez le secret webhook
   - Consultez les logs : `SELECT * FROM webhook_logs WHERE status = 'failed'`

2. **Emails non envoyés :**
   - Vérifiez la clé API email
   - Vérifiez les logs de l'application
   - Testez avec la simulation

3. **Erreurs de base de données :**
   - Vérifiez les politiques RLS
   - Vérifiez les permissions utilisateur
   - Réexécutez le script de setup si nécessaire

### Logs Utiles

```bash
# Logs de l'application
tail -f logs/payment.log

# Logs Supabase (dans le dashboard)
# Logs Lygos (dans leur dashboard)
```

## 📊 Métriques à Surveiller

1. **Taux de Conversion :**
   ```sql
   SELECT 
     ROUND(
       COUNT(CASE WHEN status = 'paid' THEN 1 END) * 100.0 / COUNT(*), 
       2
     ) as conversion_rate
   FROM orders;
   ```

2. **Revenus Mensuels :**
   ```sql
   SELECT 
     DATE_TRUNC('month', created_at) as month,
     SUM(total_price) as revenue
   FROM orders 
   WHERE status = 'paid'
   GROUP BY month
   ORDER BY month DESC;
   ```

3. **Méthodes de Paiement Populaires :**
   ```sql
   SELECT 
     payment_method_name,
     COUNT(*) as usage_count
   FROM orders 
   WHERE status = 'paid'
   GROUP BY payment_method_name
   ORDER BY usage_count DESC;
   ```

## 🔐 Sécurité

### Checklist de Sécurité

- [x] Vérification des signatures webhook
- [x] Validation des données d'entrée
- [x] Politiques RLS activées
- [x] Clés API sécurisées
- [x] HTTPS obligatoire
- [x] Rate limiting activé

### Bonnes Pratiques

1. **Rotation des Clés :**
   - Changez les clés API régulièrement
   - Utilisez des secrets forts pour les webhooks

2. **Monitoring :**
   - Surveillez les tentatives de fraude
   - Alertes sur les échecs de paiement

3. **Backup :**
   - Sauvegardez régulièrement la base de données
   - Testez la restauration

## 📞 Support

- **Documentation Lygos :** [docs.lygos.com](https://docs.lygos.com)
- **Support Technique :** support@votre-domaine.com
- **Issues GitHub :** Créez une issue pour les bugs

---

✅ **Module de Paiement Configuré avec Succès !**

Votre système de paiement est maintenant prêt à traiter les commandes de cartes NFC avec les méthodes de paiement mobiles africaines.
