# 🚨 Résolution rapide - Erreur "operator does not exist: uuid = text"

## ❌ Erreur rencontrée
```
ERROR: 42883: operator does not exist: uuid = text
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

## 🔍 Cause du problème
Il y a un conflit de types entre `uuid` et `text` dans les politiques RLS. Le champ `user_id` et `auth.uid()` ont des types différents qui ne peuvent pas être comparés directement.

## ✅ Solution rapide (2 minutes)

### Étape 1 : Diagnostiquer les types
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Exécutez ce script de diagnostic :

```sql
-- Vérifier les types
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'user_id';

SELECT 
    auth.uid() as auth_uid_value,
    pg_typeof(auth.uid()) as auth_uid_type;
```

### Étape 2 : Appliquer la solution appropriée

#### Si `user_id` est de type `uuid` :
Exécutez ce script :

```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;

-- Créer les nouvelles politiques avec conversion UUID
CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete their own profiles" ON profiles
FOR DELETE USING (auth.uid()::uuid = user_id);
```

#### Si `user_id` est de type `text` :
Exécutez ce script :

```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;

-- Créer les nouvelles politiques avec conversion TEXT
CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own profiles" ON profiles
FOR DELETE USING (auth.uid()::text = user_id);
```

### Étape 3 : Vérifier la correction
Exécutez cette requête pour vérifier que les politiques ont été créées :

```sql
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
```

### Étape 4 : Tester l'application
1. **Rechargez** votre application
2. **Connectez-vous** si ce n'est pas déjà fait
3. **Essayez de créer** un nouveau profil
4. L'erreur devrait être résolue

## 🔍 Diagnostic avancé

### Vérifier les types de colonnes
```sql
-- Vérifier tous les types de colonnes
SELECT 
    column_name,
    data_type,
    udt_name,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Tester les conversions de type
```sql
-- Tester les conversions
SELECT 
    'auth.uid()::uuid' as conversion,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NULL'
        ELSE 'OK'
    END as result
UNION ALL
SELECT 
    'auth.uid()::text' as conversion,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NULL'
        ELSE 'OK'
    END as result;
```

### Vérifier les données existantes
```sql
-- Vérifier les données et types
SELECT 
    user_id,
    pg_typeof(user_id) as user_id_type,
    LENGTH(user_id::text) as user_id_length
FROM profiles 
LIMIT 5;
```

## 🚨 Solutions alternatives

### Solution 1 : Conversion universelle (recommandée)
```sql
-- Politiques avec conversion universelle
CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own profiles" ON profiles
FOR DELETE USING (auth.uid()::text = user_id::text);
```

### Solution 2 : Vérifier et corriger le type de colonne
```sql
-- Si user_id n'est pas de type uuid, le convertir
ALTER TABLE profiles 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
```

### Solution 3 : Politiques temporaires sans type strict
```sql
-- Politiques temporaires (moins performantes mais fonctionnelles)
CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (COALESCE(auth.uid()::text, '') = COALESCE(user_id::text, ''));

CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (COALESCE(auth.uid()::text, '') = COALESCE(user_id::text, ''));
```

## ✅ Vérification finale

Après avoir appliqué la solution :
1. **Vérifiez** que les politiques sont créées sans erreur
2. **Testez** la création d'un profil
3. **Vérifiez** que l'utilisateur connecté peut voir ses propres profils
4. **Vérifiez** que les profils publics sont visibles par tous

---

**Note** : Cette erreur se produit quand les types de données ne correspondent pas dans les comparaisons. La conversion explicite de type résout le problème.
