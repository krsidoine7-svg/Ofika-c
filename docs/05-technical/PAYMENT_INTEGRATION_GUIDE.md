# 🚀 GUIDE D'INTÉGRATION - MODULE 5 : PAIEMENTS

## 📋 **ÉTAPES D'INTÉGRATION**

### **1. Configuration Base de Données**

**Exécuter le script SQL dans Supabase :**
```sql
-- Copier et exécuter le contenu de scripts/setup-payment-database.sql
-- dans l'éditeur SQL de Supabase
```

**Vérifier la création des tables :**
```sql
-- Vérifier que les tables sont créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payment_methods');

-- Vérifier les données des méthodes de paiement
SELECT * FROM payment_methods;
```

### **2. Variables d'Environnement**

**Ajouter dans `.env.local` :**
```env
# Wave API (à configurer avec vos vraies clés)

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3. Test du Flux Complet**

**Étape 1 : Accéder au Dashboard**
```
http://localhost:3000/dashboard/profiles
```

**Étape 2 : Tester la Commande**
1. Cliquer sur "Commander" dans la section "Mes Cartes NFC"
2. Sélectionner "NFC + QR Code" (15,000 XOF)
3. Choisir une méthode de paiement
4. Cliquer "Commander maintenant"

**Étape 3 : Simulation de Paiement**
1. Être redirigé vers `/payment/simulate/[paymentId]`
2. Cliquer "Simuler paiement réussi"
3. Vérifier la redirection vers le dashboard

**Étape 4 : Vérifier les Statistiques**
1. Retourner sur `/dashboard/profiles`
2. Vérifier les statistiques mises à jour
3. Aller sur `/dashboard/orders` pour voir la commande

### **4. Intégration avec l'Onboarding NFC**

**Modifier le flux d'onboarding pour inclure la commande :**
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file
