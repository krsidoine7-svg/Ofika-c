# 🔒 Guide de correction des alertes de sécurité Supabase

## 🚨 Alertes détectées

### 1. **ERREUR CRITIQUE** - RLS désactivé sur `payment_methods`
- **Niveau** : ERROR
- **Impact** : Sécurité critique
- **Description** : La table `payment_methods` est publique mais RLS n'est pas activé

### 2. **AVERTISSEMENTS** - Search path mutable sur les fonctions
- **Niveau** : WARN
- **Impact** : Sécurité modérée
- **Description** : 8 fonctions ont un search_path mutable

### 3. **AVERTISSEMENT** - Protection des mots de passe compromis désactivée
- **Niveau** : WARN
- **Impact** : Sécurité modérée
- **Description** : La protection contre les mots de passe compromis est désactivée

## ✅ Solutions

### Solution 1 : Corriger RLS sur payment_methods (CRITIQUE)

#### Via SQL (Recommandé)
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Exécutez le script `fix-payment-methods-rls.sql` :

```sql
-- Activer RLS sur payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Créer une politique de lecture publique
CREATE POLICY "payment_methods_read" ON payment_methods
FOR SELECT USING (is_active = true);
```

#### Via l'interface Supabase
1. Allez dans **"Table Editor"**
2. Sélectionnez la table **"payment_methods"**
3. Cliquez sur **"Settings"** (icône d'engrenage)
4. Activez **"Enable Row Level Security"**

### Solution 2 : Corriger les fonctions avec search_path mutable

#### Exécuter le script de correction
1. Dans **"SQL Editor"**, exécutez le script `fix-function-search-path.sql`
2. Le script corrige automatiquement toutes les fonctions

#### Vérification
```sql
-- Vérifier que les fonctions ont été corrigées
SELECT 
    routine_name,
    security_type,
    search_path
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'generate_custom_url',
    'check_max_profiles_per_user',
    'check_max_links_per_profile',
    'check_max_cards_per_user',
    'generate_unique_card_code',
    'update_updated_at_column',
    'handle_new_user',
    'handle_user_login'
);
```

### Solution 3 : Activer la protection des mots de passe compromis

#### Via l'interface Supabase
1. Allez dans **"Authentication"** dans le menu de gauche
2. Cliquez sur **"Settings"**
3. Trouvez la section **"Password Protection"**
4. Activez **"Leaked Password Protection"**
5. Cliquez sur **"Save"**

#### Via l'API (Alternative)
```bash
curl -X PATCH 'https://your-project.supabase.co/auth/v1/admin/settings' \
  -H 'apikey: YOUR_SERVICE_ROLE_KEY' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "PASSWORD_MIN_LENGTH": 8,
    "PASSWORD_REQUIRE_UPPERCASE": true,
    "PASSWORD_REQUIRE_LOWERCASE": true,
    "PASSWORD_REQUIRE_NUMBERS": true,
    "PASSWORD_REQUIRE_SYMBOLS": true,
    "PASSWORD_LEAKED_PROTECTION": true
  }'
```

## 🔍 Vérification des corrections

### Vérifier RLS sur payment_methods
```sql
-- Vérifier que RLS est activé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'payment_methods' AND schemaname = 'public';

-- Vérifier les politiques
SELECT 
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'payment_methods' 
AND schemaname = 'public';
```

### Vérifier les fonctions corrigées
```sql
-- Vérifier le search_path des fonctions
SELECT 
    routine_name,
    security_type,
    search_path
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%check_%' 
OR routine_name LIKE '%generate_%'
OR routine_name LIKE '%handle_%'
OR routine_name LIKE '%update_%';
```

### Vérifier la protection des mots de passe
1. Allez dans **"Authentication" > "Settings"**
2. Vérifiez que **"Leaked Password Protection"** est activé
3. Testez en créant un utilisateur avec un mot de passe compromis

## 🚨 Priorités de correction

### 1. **IMMÉDIAT** - RLS sur payment_methods
- **Impact** : Critique
- **Temps** : 2 minutes
- **Action** : Exécuter le script SQL

### 2. **URGENT** - Fonctions search_path
- **Impact** : Modéré
- **Temps** : 5 minutes
- **Action** : Exécuter le script de correction

### 3. **IMPORTANT** - Protection des mots de passe
- **Impact** : Modéré
- **Temps** : 2 minutes
- **Action** : Activer via l'interface

## 📋 Checklist de sécurité

- [ ] RLS activé sur `payment_methods`
- [ ] Politique de lecture créée pour `payment_methods`
- [ ] Toutes les fonctions ont `SET search_path = public`
- [ ] Protection des mots de passe compromis activée
- [ ] Vérification des corrections effectuée
- [ ] Test de sécurité effectué

## 🔧 Scripts fournis

1. **`fix-payment-methods-rls.sql`** - Corrige RLS sur payment_methods
2. **`fix-function-search-path.sql`** - Corrige toutes les fonctions
3. **`SECURITY_FIXES_GUIDE.md`** - Guide complet de correction

## ✅ Résultat attendu

Après avoir appliqué toutes les corrections :
- ✅ **0 erreur de sécurité**
- ✅ **Alertes de sécurité résolues**
- ✅ **Base de données sécurisée**
- ✅ **Conformité aux bonnes pratiques**

---

**Note** : Ces corrections améliorent significativement la sécurité de votre application Supabase. Il est recommandé de les appliquer dans l'ordre de priorité indiqué.
