# 🚨 Résolution rapide - Erreur "Could not find the 'custom_links' column"

## ❌ Erreur rencontrée
```
PGRST204: Could not find the 'custom_links' column of 'profiles' in the schema cache
```

## ✅ Solution rapide (2 minutes)

### Étape 1 : Ouvrir Supabase SQL Editor
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**

### Étape 2 : Exécuter le script de migration
Copiez et collez ce script dans l'éditeur SQL :

```sql
-- Migration pour ajouter les nouveaux champs à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;
```

### Étape 3 : Exécuter le script
1. Cliquez sur **"Run"** ou appuyez sur `Ctrl+Enter`
2. Attendez que le script se termine
3. Vous devriez voir "Success. No rows returned"

### Étape 4 : Vérifier la migration
Exécutez cette requête pour vérifier que les colonnes ont été ajoutées :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('whatsapp', 'facebook', 'instagram', 'twitter', 'website', 'custom_links')
ORDER BY column_name;
```

### Étape 5 : Tester l'application
1. Rechargez votre application Next.js
2. Essayez de créer ou modifier un profil
3. L'erreur devrait être résolue

## 🔍 Vérification alternative

Si vous préférez vérifier via l'interface Supabase :

1. Allez dans **"Table Editor"**
2. Sélectionnez la table **"profiles"**
3. Vérifiez que ces colonnes existent :
   - `whatsapp` (text)
   - `facebook` (text)
   - `instagram` (text)
   - `twitter` (text)
   - `website` (text)
   - `custom_links` (jsonb)

## 🚨 Si le problème persiste

### Vérifier les permissions
Assurez-vous que votre utilisateur a les permissions pour modifier le schéma :
- Rôle `postgres` ou `supabase_admin`
- Ou permissions `ALTER TABLE` sur la table `profiles`

### Vérifier la connexion
```sql
-- Tester la connexion à la base de données
SELECT current_database(), current_user;
```

### Vérifier l'existence de la table
```sql
-- Vérifier que la table profiles existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
```

## 📋 Script complet (optionnel)

Si vous voulez exécuter le script complet avec tous les détails :

```sql
-- Migration complète pour la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;

-- Ajouter des commentaires
COMMENT ON COLUMN profiles.whatsapp IS 'URL du profil WhatsApp';
COMMENT ON COLUMN profiles.facebook IS 'URL du profil Facebook';
COMMENT ON COLUMN profiles.instagram IS 'URL du profil Instagram';
COMMENT ON COLUMN profiles.twitter IS 'URL du profil Twitter';
COMMENT ON COLUMN profiles.website IS 'URL du site web personnel';
COMMENT ON COLUMN profiles.custom_links IS 'Liens personnalisés (boutique, portfolio, etc.)';

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_custom_links ON profiles USING GIN(custom_links);

-- Mettre à jour les données existantes
UPDATE profiles 
SET custom_links = '[]'::jsonb 
WHERE custom_links IS NULL;
```

## ✅ Vérification finale

Après avoir exécuté la migration :
1. **Rechargez** votre application
2. **Essayez de créer** un nouveau profil
3. **Vérifiez** que tous les champs s'affichent correctement
4. **Testez l'upload** d'une image de profil

---

**Note** : Cette erreur ne devrait se produire qu'une seule fois. Une fois la migration exécutée, l'application fonctionnera normalement.
