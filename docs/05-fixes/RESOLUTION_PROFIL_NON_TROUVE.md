# 🔍 Résolution : "Profil non trouvé"

## 🎯 Diagnostic en 3 étapes

### Étape 1 : Diagnostiquer le problème

Dans **Supabase SQL Editor**, exécutez :
```sql
-- Copiez-collez le contenu de : DIAGNOSTIC_PROFIL.sql
```

Cela vous dira :
- ✅ Si RLS est activé
- 📊 Combien de profils sont publics/actifs
- 🔗 Quelles URLs sont disponibles
- ⚠️ Quels sont les problèmes potentiels

### Étape 2 : Corriger automatiquement

Dans **Supabase SQL Editor**, exécutez :
```sql
-- Copiez-collez le contenu de : FIX_PROFILS_PUBLICS.sql
```

Cela va :
- ✅ Activer TOUS vos profils (is_public = true, is_active = true)
- ✅ Activer TOUS vos profils NFC (status = 'active')
- ✅ Créer des usernames automatiques si manquants
- ✅ Vous montrer les URLs disponibles

### Étape 3 : Tester

Après avoir exécuté le script, le résultat vous montrera :
```
=== TESTEZ CES URLS ===
https://votre-domaine.com/john-doe
```

Copiez cette URL et testez-la dans votre navigateur !

---

## 🐛 Problèmes courants et solutions

### Problème 1 : "Aucun profil trouvé"
**Cause :** Vous n'avez créé aucun profil  
**Solution :** Allez dans votre dashboard et créez un profil

### Problème 2 : "Profils existent mais pas visibles"
**Cause :** `is_public = false` ou `is_active = false`  
**Solution :** Exécutez `FIX_PROFILS_PUBLICS.sql`

### Problème 3 : "URL ne correspond pas"
**Cause :** L'URL que vous tapez ne correspond pas au `username` ou `custom_url`  
**Solution :** 
1. Exécutez `DIAGNOSTIC_PROFIL.sql` pour voir les URLs disponibles
2. Utilisez exactement l'URL indiquée

**Exemple :**
- ❌ `https://ofika.com/Jean Dupont` (espaces, majuscules)
- ✅ `https://ofika.com/jean-dupont` (tirets, minuscules)

### Problème 4 : "RLS bloque l'accès"
**Cause :** RLS est activé mais les politiques ne sont pas créées  
**Solution :** Exécutez `RLS_POLICIES_ONLY.sql`

### Problème 5 : "Les anciennes colonnes existent encore"
**Cause :** La migration n'a pas été appliquée  
**Solution :** 
1. Exécutez `MIGRATE_DATA_BEFORE_DRIZZLE.sql`
2. OU utilisez `EXECUTE_THIS_IN_SUPABASE.sql` (tout-en-un)

---

## 📝 Vérifications manuelles

### Dans Supabase Table Editor

1. Allez dans **Table Editor** → `profiles`
2. Vérifiez pour chaque profil :
   - ✅ `is_public` = `true` (coché)
   - ✅ `is_active` = `true` (coché)
   - ✅ `username` OU `custom_url` a une valeur (ex: "jean-dupont")

3. Notez le `username` ou `custom_url`

### Tester l'URL

Testez : `https://votre-domaine.com/[username]`

Remplacez :
- `votre-domaine.com` par votre domaine (ex: localhost:3000)
- `[username]` par la valeur exacte de `username` ou `custom_url`

---

## 🔧 Script de correction rapide (tout-en-un)

Si vous voulez tout réinitialiser et corriger d'un coup :

```sql
-- 1. Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Activer tous les profils
UPDATE profiles SET is_public = true, is_active = true;
UPDATE nfc_profiles SET status = 'active';

-- 3. Créer des usernames si manquants
UPDATE profiles
SET username = LOWER(REPLACE(name, ' ', '-'))
WHERE username IS NULL AND name IS NOT NULL;

-- 4. Vérifier le résultat
SELECT 
  CONCAT('https://votre-domaine.com/', COALESCE(custom_url, username)) as url_a_tester,
  name,
  is_public,
  is_active
FROM profiles
WHERE is_public = true AND is_active = true;
```

---

## 🎯 Checklist finale

Avant de tester votre page publique, vérifiez :

- [ ] RLS est activé sur `profiles` et `nfc_profiles`
- [ ] Les politiques RLS sont créées (via `RLS_POLICIES_ONLY.sql`)
- [ ] Au moins un profil existe dans la table `profiles`
- [ ] Ce profil a `is_public = true` ET `is_active = true`
- [ ] Ce profil a un `username` OU `custom_url` défini
- [ ] L'URL que vous testez correspond EXACTEMENT au `username`/`custom_url`

---

## 💡 Astuce : Voir les logs en temps réel

Ouvrez la console de votre navigateur (F12) et regardez les erreurs lors du chargement de la page.

Si vous voyez :
- **"Profile not found in both tables"** → Le profil n'existe pas ou l'URL ne correspond pas
- **"Error fetching profile"** → Problème de connexion à Supabase
- **"Permission denied"** → RLS bloque l'accès (vérifiez les politiques)

---

**Exécutez `DIAGNOSTIC_PROFIL.sql` et partagez-moi les résultats si le problème persiste !** 🤝
