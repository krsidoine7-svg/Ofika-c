# 🔧 FIX ERREUR 406 SUPABASE

## 🎯 PROBLÈME

```
GET .../nfc_profiles?... 406 (Not Acceptable)
```

L'erreur 406 de Supabase peut être causée par :
1. Schema cache obsolète
2. Headers manquants
3. Configuration API incorrecte

## ✅ SOLUTION 1 : Recharger le Schema Cache (RAPIDE)

### Dans Supabase Dashboard :

1. **Ouvrir** votre projet Supabase : https://supabase.com/dashboard/project/graqvtzmefiwsafaubcw

2. **Aller dans API Settings**
   - Menu gauche → Settings → API

3. **Reloader le Schema Cache**
   - Cliquer sur le bouton **"Reload schema"** ou **"Refresh"**
   - Attendre quelques secondes

4. **Vérifier les tables exposées**
   - Vérifier que `nfc_profiles` apparaît dans la liste
   - Vérifier que `analytics_events` apparaît

## ✅ SOLUTION 2 : Vérifier la configuration RLS

### Vérifier que les tables sont accessibles publiquement :

```sql
-- Vérifier RLS sur nfc_profiles
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'nfc_profiles';

-- Si RLS est activé, vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'nfc_profiles';
```

### Si pas de politique SELECT publique, en créer une :

```sql
-- Permettre la lecture publique des profils actifs
CREATE POLICY "nfc_profiles_public_read" ON nfc_profiles
  FOR SELECT 
  USING (status = 'active');
```

## ✅ SOLUTION 3 : Vérifier les Anon Key

### Dans `.env` :

```bash
# Vérifier que ces variables sont correctes
NEXT_PUBLIC_SUPABASE_URL=https://graqvtzmefiwsafaubcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key

# NE PAS utiliser la SERVICE_ROLE_KEY côté client !
```

## ✅ SOLUTION 4 : Script SQL Complet

Exécuter dans Supabase SQL Editor :

```sql
-- 1. Vérifier que nfc_profiles a RLS
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "nfc_profiles_public_read" ON nfc_profiles;

-- 3. Créer politique de lecture publique
CREATE POLICY "nfc_profiles_public_read" ON nfc_profiles
  FOR SELECT 
  USING (status = 'active');

-- 4. Vérifier
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'nfc_profiles';
```

## 🔍 VÉRIFICATION

Après ces corrections, tester dans la console :

```javascript
// Ouvrir la console (F12) et tester
const { data, error } = await supabase
  .from('nfc_profiles')
  .select('id, design_choice, color_theme')
  .eq('status', 'active')
  .limit(1)

console.log({ data, error })
```

Résultat attendu :
```javascript
{ 
  data: [{ id: '...', design_choice: '...', color_theme: '...' }],
  error: null 
}
```

## 🆘 SI TOUJOURS 406

Il se peut que ce soit un problème de **région Supabase**. Vérifier :

1. Dashboard → Settings → General
2. Vérifier la région du projet
3. Si nécessaire, recréer le projet dans la bonne région

Ou contacter le support Supabase pour vérifier l'état du projet.
