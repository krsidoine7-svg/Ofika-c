# 🚨 Résolution rapide - Erreur "new row violates row-level security policy"

## ❌ Erreur rencontrée
```
new row violates row-level security policy
```

## 🔍 Cause du problème
Les politiques de sécurité au niveau des lignes (RLS) de Supabase empêchent l'insertion de nouvelles données dans la table `profiles`. Cela peut être dû à :
- RLS activé sans politiques appropriées
- Politiques mal configurées
- Utilisateur non authentifié
- Politiques trop restrictives

## ✅ Solution rapide (2 minutes)

### Étape 1 : Ouvrir Supabase SQL Editor
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**

### Étape 2 : Exécuter le script de configuration RLS
Copiez et collez ce script dans l'éditeur SQL :

```sql
-- Configuration des politiques RLS pour la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Politique pour la lecture des profils publics
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (is_public = true);

-- Politique pour que les utilisateurs voient leurs propres profils
CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour l'insertion de nouveaux profils
CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour la mise à jour des profils
CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour la suppression des profils
CREATE POLICY "Users can delete their own profiles" ON profiles
FOR DELETE USING (auth.uid() = user_id);
```

### Étape 3 : Exécuter le script
1. Cliquez sur **"Run"** ou appuyez sur `Ctrl+Enter`
2. Attendez que le script se termine
3. Vous devriez voir "Success. No rows returned"

### Étape 4 : Vérifier la configuration
Exécutez cette requête pour vérifier que les politiques ont été créées :

```sql
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
```

**Résultat attendu :** Vous devriez voir 5 politiques listées

### Étape 5 : Tester l'application
1. **Assurez-vous d'être connecté** à votre application
2. Essayez de créer ou modifier un profil
3. L'erreur devrait être résolue

## 🔍 Diagnostic avancé

### Vérifier si RLS est activé
```sql
-- Vérifier le statut RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
```

### Vérifier les politiques existantes
```sql
-- Lister toutes les politiques
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';
```

### Tester les permissions
```sql
-- Tester si l'utilisateur peut insérer
SELECT auth.uid() as current_user_id;
```

## 🚨 Solutions alternatives

### Solution 1 : Désactiver temporairement RLS (pour debug)
```sql
-- ATTENTION: Ne faites cela qu'en développement
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### Solution 2 : Politique permissive (temporaire)
```sql
-- Politique très permissive (à utiliser avec précaution)
CREATE POLICY "Allow all operations" ON profiles
FOR ALL USING (true) WITH CHECK (true);
```

### Solution 3 : Vérifier l'authentification
Assurez-vous que :
- L'utilisateur est connecté (`auth.uid()` retourne un UUID)
- Le token d'authentification est valide
- Les variables d'environnement Supabase sont correctes

## 🔧 Script complet de migration

Si vous voulez exécuter la migration complète (colonnes + RLS) :

```sql
-- 1. Corriger les tailles des colonnes
ALTER TABLE profiles 
ALTER COLUMN bio TYPE TEXT,
ALTER COLUMN name TYPE TEXT,
ALTER COLUMN custom_url TYPE TEXT,
ALTER COLUMN username TYPE TEXT,
ALTER COLUMN image_url TYPE TEXT;

-- 2. Ajouter les nouvelles colonnes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;

-- 3. Configurer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" ON profiles
FOR DELETE USING (auth.uid() = user_id);
```

## ✅ Vérification finale

Après avoir exécuté la configuration RLS :
1. **Rechargez** votre application
2. **Connectez-vous** si ce n'est pas déjà fait
3. **Essayez de créer** un nouveau profil
4. **Vérifiez** que tous les champs s'affichent correctement
5. **Testez** l'upload d'une image de profil

---

**Note** : Cette erreur se produit quand RLS est activé mais les politiques ne permettent pas l'insertion. Une fois les politiques configurées, l'application fonctionnera normalement.
