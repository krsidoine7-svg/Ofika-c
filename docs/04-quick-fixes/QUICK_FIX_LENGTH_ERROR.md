# 🚨 Résolution rapide - Erreur "value too long for type character varying(100)"

## ❌ Erreur rencontrée
```
22001: value too long for type character varying(100)
```

## 🔍 Cause du problème
Une ou plusieurs colonnes de la table `profiles` sont limitées à 100 caractères, mais vous essayez d'insérer une valeur plus longue (probablement dans le champ `bio`).

## ✅ Solution rapide (1 minute)

### Étape 1 : Ouvrir Supabase SQL Editor
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**

### Étape 2 : Exécuter le script de correction
Copiez et collez ce script dans l'éditeur SQL :

```sql
-- Corriger les tailles des colonnes limitées
ALTER TABLE profiles 
ALTER COLUMN bio TYPE TEXT,
ALTER COLUMN name TYPE TEXT,
ALTER COLUMN custom_url TYPE TEXT,
ALTER COLUMN username TYPE TEXT,
ALTER COLUMN image_url TYPE TEXT;
```

### Étape 3 : Exécuter le script
1. Cliquez sur **"Run"** ou appuyez sur `Ctrl+Enter`
2. Attendez que le script se termine
3. Vous devriez voir "Success. No rows returned"

### Étape 4 : Vérifier la correction
Exécutez cette requête pour vérifier que les colonnes ont été modifiées :

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('bio', 'name', 'custom_url', 'username', 'image_url')
ORDER BY column_name;
```

**Résultat attendu :** `character_maximum_length` devrait être `null` (signifie TEXT = illimité)

### Étape 5 : Tester l'application
1. Rechargez votre application Next.js
2. Essayez de créer ou modifier un profil avec une bio longue
3. L'erreur devrait être résolue

## 🔍 Diagnostic avancé

### Identifier quel champ cause le problème
Si vous voulez savoir exactement quel champ pose problème :

```sql
-- Vérifier les tailles actuelles des colonnes
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    CASE 
        WHEN character_maximum_length IS NULL THEN 'Illimité (TEXT)'
        ELSE character_maximum_length::text || ' caractères'
    END as taille_limite
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY character_maximum_length;
```

### Vérifier les données existantes
```sql
-- Vérifier s'il y a des données qui dépassent les limites
SELECT 
    id,
    name,
    LENGTH(name) as name_length,
    bio,
    LENGTH(bio) as bio_length
FROM profiles 
WHERE LENGTH(name) > 100 OR LENGTH(bio) > 100
LIMIT 10;
```

## 🚨 Si le problème persiste

### Vérifier les contraintes
```sql
-- Vérifier s'il y a des contraintes qui limitent la taille
SELECT 
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public';
```

### Script complet de migration
Si vous voulez exécuter la migration complète :

```sql
-- Migration complète
-- 1. Corriger les tailles des colonnes existantes
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

-- 3. Ajouter des commentaires
COMMENT ON COLUMN profiles.bio IS 'Description du profil (illimité)';
COMMENT ON COLUMN profiles.name IS 'Nom du profil (illimité)';
COMMENT ON COLUMN profiles.whatsapp IS 'URL du profil WhatsApp';
COMMENT ON COLUMN profiles.facebook IS 'URL du profil Facebook';
COMMENT ON COLUMN profiles.instagram IS 'URL du profil Instagram';
COMMENT ON COLUMN profiles.twitter IS 'URL du profil Twitter';
COMMENT ON COLUMN profiles.website IS 'URL du site web personnel';
COMMENT ON COLUMN profiles.custom_links IS 'Liens personnalisés (boutique, portfolio, etc.)';
```

## ✅ Vérification finale

Après avoir exécuté la correction :
1. **Rechargez** votre application
2. **Essayez de créer** un profil avec une bio de 200 caractères
3. **Vérifiez** que tous les champs s'affichent correctement
4. **Testez** l'upload d'une image de profil

---

**Note** : Cette erreur se produit quand les colonnes sont limitées en taille. En les convertissant en `TEXT`, elles peuvent accepter des valeurs de n'importe quelle longueur.
