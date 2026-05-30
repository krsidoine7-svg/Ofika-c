# 🚨 Résolution rapide - Nettoyage des politiques RLS en doublon

## ❌ Problème identifié
Vous avez plusieurs politiques RLS en doublon et redondantes qui peuvent causer des conflits :
- `Profiles are viewable by everyone when public` (SELECT)
- `Public profiles are viewable by everyone` (SELECT) 
- `Users can view own profiles` (SELECT)
- `Users can view their own profiles` (SELECT)
- `Users can manage own profiles` (ALL)
- Et d'autres...

## ✅ Solution rapide (2 minutes)

### Étape 1 : Nettoyer les politiques existantes
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Copiez et exécutez ce script de nettoyage :

```sql
-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Profiles are viewable by everyone when public" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
```

### Étape 2 : Créer un ensemble propre de politiques
Exécutez ce script pour créer des politiques propres et non redondantes :

```sql
-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique 1: Lecture des profils publics
CREATE POLICY "public_profiles_read" ON profiles
FOR SELECT USING (is_public = true);

-- Politique 2: Lecture des profils privés (propriétaire uniquement)
CREATE POLICY "private_profiles_read" ON profiles
FOR SELECT USING (auth.uid()::text = user_id);

-- Politique 3: Insertion de nouveaux profils
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Politique 4: Mise à jour des profils
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id);

-- Politique 5: Suppression des profils
CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (auth.uid()::text = user_id);
```

### Étape 3 : Vérifier la configuration
Exécutez cette requête pour vérifier que vous avez exactement 5 politiques :

```sql
SELECT 
    policyname, 
    cmd as operation,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY 
    CASE cmd 
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END;
```

**Résultat attendu :** Vous devriez voir exactement 5 politiques :
1. `public_profiles_read` (SELECT)
2. `private_profiles_read` (SELECT)
3. `profiles_insert` (INSERT)
4. `profiles_update` (UPDATE)
5. `profiles_delete` (DELETE)

### Étape 4 : Tester l'application
1. **Rechargez** votre application Next.js
2. **Connectez-vous** si ce n'est pas déjà fait
3. **Essayez de créer** un nouveau profil
4. **Vérifiez** que tout fonctionne correctement

## 🔍 Pourquoi cette solution fonctionne

### Problème avec les politiques en doublon :
- **Conflits** : Plusieurs politiques pour la même opération peuvent se contredire
- **Performance** : Plus de politiques = plus de vérifications
- **Confusion** : Difficile de déboguer quand il y a trop de politiques

### Avantages de la solution propre :
- **5 politiques seulement** : Une par opération nécessaire
- **Logique claire** : Chaque politique a un rôle spécifique
- **Pas de redondance** : Évite les conflits
- **Performance optimale** : Moins de vérifications

## 🚨 Si le problème persiste

### Vérifier les permissions
```sql
-- Vérifier que l'utilisateur peut insérer
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No user logged in'
        ELSE 'User is logged in'
    END as auth_status;
```

### Vérifier les données de test
```sql
-- Vérifier les profils existants
SELECT 
    id,
    name,
    user_id,
    is_public,
    is_active
FROM profiles 
LIMIT 5;
```

### Tester manuellement
```sql
-- Test d'insertion (remplacez par votre user_id réel)
INSERT INTO profiles (name, profile_type, user_id, is_public, is_active)
VALUES ('Test Profile', 'personal', auth.uid()::text, false, true);
```

## ✅ Vérification finale

Après le nettoyage, vous devriez avoir :
- ✅ Exactement 5 politiques RLS
- ✅ Aucune politique en doublon
- ✅ Création de profils fonctionnelle
- ✅ Lecture des profils publics et privés
- ✅ Mise à jour et suppression des profils

---

**Note** : Cette solution nettoie complètement les politiques RLS et crée un ensemble minimal et fonctionnel. C'est la meilleure pratique pour éviter les conflits.
