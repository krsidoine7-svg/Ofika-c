# 🚀 Instructions pour appliquer les migrations Supabase

## ⚠️ Problème rencontré
L'installation du CLI Supabase n'est pas supportée via npm. Nous allons donc exécuter les migrations manuellement via l'interface web de Supabase.

## 📋 Étapes à suivre

### 1️⃣ Ouvrir Supabase
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### 2️⃣ Ouvrir le SQL Editor
1. Dans le menu de gauche, cliquez sur **SQL Editor** (icône `</>`)
2. Cliquez sur **"New query"** pour créer une nouvelle requête

### 3️⃣ Exécuter le script de migration
1. Ouvrez le fichier : `s:\nextjs-base-project\supabase\EXECUTE_THIS_IN_SUPABASE.sql`
2. **Copiez TOUT le contenu du fichier** (Ctrl+A puis Ctrl+C)
3. **Collez-le dans l'éditeur SQL** de Supabase (Ctrl+V)
4. Cliquez sur **"Run"** (ou appuyez sur F5)

### 4️⃣ Vérifier les résultats
Après l'exécution, vous devriez voir dans les messages (onglet "Messages" ou "Results") :

```
========================================
RÉSULTATS DE LA MIGRATION
========================================
✅ Profils publics actifs: X
✅ Profils NFC actifs: X

État RLS:
  - profiles: ✅ Activé
  - links: ✅ Activé
  - nfc_profiles: ✅ Activé
========================================
Migration terminée avec succès ! 🎉
========================================
```

### 5️⃣ Vérifier que RLS est activé
1. Allez dans **Table Editor** (dans le menu de gauche)
2. Pour chaque table (`profiles`, `links`, `nfc_profiles`, `users`), vérifiez que :
   - Le statut RLS indique **"Enabled"** (et non plus "Libre")
   - Il y a des politiques RLS actives

### 6️⃣ Tester votre page publique
1. Retournez sur votre application
2. Allez à l'URL : `https://votre-domaine.com/[username]`
   - Remplacez `[username]` par le `username` ou `custom_url` de votre profil
3. Vous devriez maintenant voir votre profil s'afficher ! 🎉

## ❓ En cas de problème

### Profil toujours non trouvé ?
Vérifiez dans Supabase → Table Editor → `profiles` :
- ✅ `is_public` = `true`
- ✅ `is_active` = `true`
- ✅ `username` ou `custom_url` correspond à ce que vous tapez dans l'URL

### RLS toujours désactivé ?
Réexécutez cette commande SQL simple :
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;
```

### Erreurs dans le script ?
Si vous avez des erreurs lors de l'exécution :
1. Notez le message d'erreur exact
2. Partagez-le avec moi
3. Je vous aiderai à le corriger

## 📝 Ce que fait le script

Le script de migration effectue les actions suivantes :

1. **Migration des réseaux sociaux** :
   - Ajoute la colonne `social_links` (format JSON)
   - Migre les données des anciennes colonnes (`whatsapp`, `facebook`, etc.)
   - Supprime les anciennes colonnes
   - Ajoute une validation (max 4 liens)

2. **Activation du RLS (Row Level Security)** :
   - Active RLS sur toutes les tables principales
   - Crée les politiques d'accès :
     - Profils publics accessibles à tous
     - Profils privés accessibles uniquement au propriétaire
     - Links accessibles via les profils publics

3. **Correction des données** :
   - Met à jour tous les profils pour qu'ils soient publics et actifs par défaut
   - Active tous les profils NFC

4. **Vérification** :
   - Affiche un résumé de la migration
   - Confirme que RLS est bien activé

## 🎯 Résultat attendu

Après l'exécution réussie du script :
- ✅ RLS est activé sur toutes les tables
- ✅ Vos profils sont accessibles publiquement
- ✅ Les réseaux sociaux utilisent le nouveau format JSON
- ✅ Votre page publique fonctionne !

---

**Besoin d'aide ?** N'hésitez pas à me demander ! 🤝
