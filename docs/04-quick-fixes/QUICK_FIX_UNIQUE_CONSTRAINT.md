# 🚨 Résolution rapide - Erreur "duplicate key value violates unique constraint"

## ❌ Erreur rencontrée
```
23505: duplicate key value violates unique constraint "profiles_custom_url_key"
```

## 🔍 Cause du problème
L'URL personnalisée (`custom_url`) que vous essayez d'utiliser est déjà prise par un autre profil. La table `profiles` a une contrainte d'unicité sur cette colonne.

## ✅ Solutions

### Solution 1 : Vérifier les URLs existantes (Recommandée)
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Exécutez cette requête pour voir les URLs déjà utilisées :

```sql
-- Vérifier les URLs personnalisées existantes
SELECT 
    id,
    name,
    custom_url,
    username,
    is_active,
    created_at
FROM profiles 
WHERE custom_url IS NOT NULL 
AND custom_url != ''
ORDER BY custom_url;
```

### Solution 2 : Trouver une URL disponible
Exécutez cette requête pour générer des suggestions :

```sql
-- Générer des suggestions d'URLs
WITH suggestions AS (
    SELECT 
        'mon-profil' as base_url,
        'mon-profil1' as suggestion1,
        'mon-profil2' as suggestion2,
        'mon-profil-' || EXTRACT(YEAR FROM NOW()) as suggestion3,
        'mon-profil-pro' as suggestion4
)
SELECT 
    s.*,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE custom_url = s.suggestion1 AND is_active = true) 
        THEN 'Disponible' 
        ELSE 'Pris' 
    END as suggestion1_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE custom_url = s.suggestion2 AND is_active = true) 
        THEN 'Disponible' 
        ELSE 'Pris' 
    END as suggestion2_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE custom_url = s.suggestion3 AND is_active = true) 
        THEN 'Disponible' 
        ELSE 'Pris' 
    END as suggestion3_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE custom_url = s.suggestion4 AND is_active = true) 
        THEN 'Disponible' 
        ELSE 'Pris' 
    END as suggestion4_status
FROM suggestions s;
```

### Solution 3 : Utiliser l'interface améliorée
L'application a maintenant un vérificateur d'URL en temps réel qui :
- ✅ Vérifie automatiquement la disponibilité
- ✅ Suggère des alternatives
- ✅ Empêche la soumission si l'URL est prise
- ✅ Affiche des suggestions cliquables

### Solution 4 : Supprimer la contrainte d'unicité (Non recommandée)
⚠️ **Attention** : Cette solution n'est pas recommandée car elle peut causer des conflits.

```sql
-- Supprimer la contrainte d'unicité (NON RECOMMANDÉ)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_custom_url_key;
```

## 🔍 Diagnostic avancé

### Vérifier toutes les contraintes d'unicité
```sql
-- Lister toutes les contraintes d'unicité
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name;
```

### Vérifier les doublons
```sql
-- Trouver les URLs en doublon
SELECT 
    custom_url,
    COUNT(*) as count,
    array_agg(id) as profile_ids
FROM profiles 
WHERE custom_url IS NOT NULL 
AND custom_url != ''
GROUP BY custom_url
HAVING COUNT(*) > 1;
```

### Vérifier les usernames en doublon
```sql
-- Trouver les usernames en doublon
SELECT 
    username,
    COUNT(*) as count,
    array_agg(id) as profile_ids
FROM profiles 
WHERE username IS NOT NULL 
AND username != ''
GROUP BY username
HAVING COUNT(*) > 1;
```

## 🚀 Prévention des erreurs

### Côté client (déjà implémenté)
- **Vérification en temps réel** : L'URL est vérifiée pendant la frappe
- **Suggestions automatiques** : Des alternatives sont proposées
- **Validation avant soumission** : Empêche l'envoi d'URLs prises

### Côté serveur (recommandé)
```sql
-- Créer une fonction pour vérifier la disponibilité
CREATE OR REPLACE FUNCTION is_custom_url_available(
    url_to_check text,
    exclude_profile_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE custom_url = url_to_check 
        AND is_active = true
        AND (exclude_profile_id IS NULL OR id != exclude_profile_id)
    );
END;
$$;
```

## ✅ Vérification finale

Après avoir résolu le problème :
1. **Vérifiez** que l'URL est disponible
2. **Testez** la création d'un profil avec une URL unique
3. **Vérifiez** que le vérificateur d'URL fonctionne
4. **Testez** les suggestions d'URLs

---

**Note** : Cette erreur se produit quand vous essayez d'utiliser une URL personnalisée qui existe déjà. Utilisez le vérificateur d'URL intégré pour éviter ce problème à l'avenir.
