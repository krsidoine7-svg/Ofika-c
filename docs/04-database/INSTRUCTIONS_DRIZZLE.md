# 🚀 Migration avec Drizzle + Supabase RLS

## ⚠️ Important à savoir

**Drizzle gère** : La structure des tables (colonnes, types, relations)  
**Drizzle NE gère PAS** : Les politiques RLS (Row Level Security)

Nous allons donc utiliser une **approche hybride** :
1. ✅ Drizzle pour modifier la structure des tables
2. ✅ SQL manuel pour activer RLS et créer les politiques

---

## 📋 Étape 1 : Pousser les changements de structure avec Drizzle

### 1.1 Vérifier que DATABASE_URL est configuré
Vérifiez que votre fichier `.env` contient :
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
```

Pour trouver votre DATABASE_URL :
1. Allez sur Supabase Dashboard
2. Settings → Database
3. Copiez la **Connection string** (PostgreSQL)
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

### 1.2 Générer les migrations
```bash
npm run db:generate
```

Cette commande :
- ✅ Analyse votre schéma Drizzle (`drizzle/schema.ts`)
- ✅ Détecte les changements (suppression des anciennes colonnes de réseaux sociaux)
- ✅ Crée les fichiers de migration dans `drizzle/migrations/`

### 1.3 Pousser les changements vers Supabase
```bash
npm run db:push
```

⚠️ **ATTENTION** : Cette commande va :
- Supprimer les colonnes : `whatsapp`, `facebook`, `instagram`, `twitter`, `youtube`, `tiktok`, `linkedin`, `website`
- Ajouter la colonne : `social_links` (JSONB)

**Il est recommandé de faire une sauvegarde de vos données avant !**

### Alternative : Push sans prompt
Si vous êtes sûr, vous pouvez forcer le push :
```bash
npx drizzle-kit push --force
```

---

## 📋 Étape 2 : Activer RLS manuellement

Drizzle ne gère pas RLS, donc vous devez l'activer manuellement dans Supabase.

### 2.1 Ouvrir Supabase SQL Editor
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu

### 2.2 Exécuter le script RLS
1. Cliquez sur **"New query"**
2. Ouvrez le fichier : `s:\nextjs-base-project\supabase\RLS_POLICIES_ONLY.sql`
3. **Copiez tout le contenu** (Ctrl+A, Ctrl+C)
4. **Collez dans l'éditeur SQL** (Ctrl+V)
5. Cliquez sur **"Run"** (F5)

### 2.3 Vérifier que RLS est activé
Après l'exécution, vous devriez voir :
```
========================================
RLS ACTIVÉ:
  - profiles: ✅
  - links: ✅
  - nfc_profiles: ✅
========================================
```

---

## 📋 Étape 3 : Migrer les données (IMPORTANT !)

⚠️ **Si vous aviez déjà des données dans les anciennes colonnes de réseaux sociaux**, vous devez les migrer manuellement.

### 3.1 Script de migration des données
Exécutez ce script dans Supabase SQL Editor **AVANT** de pousser avec Drizzle :

```sql
-- Migrer les anciennes données vers social_links
UPDATE profiles
SET social_links = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'platform', social_type,
      'url', social_url
    )
  )
  FROM (
    SELECT 'whatsapp' as social_type, whatsapp as social_url WHERE whatsapp IS NOT NULL AND whatsapp != ''
    UNION ALL
    SELECT 'facebook', facebook WHERE facebook IS NOT NULL AND facebook != ''
    UNION ALL
    SELECT 'instagram', instagram WHERE instagram IS NOT NULL AND instagram != ''
    UNION ALL
    SELECT 'twitter', twitter WHERE twitter IS NOT NULL AND twitter != ''
    UNION ALL
    SELECT 'youtube', youtube WHERE youtube IS NOT NULL AND youtube != ''
    UNION ALL
    SELECT 'tiktok', tiktok WHERE tiktok IS NOT NULL AND tiktok != ''
    UNION ALL
    SELECT 'linkedin', linkedin WHERE linkedin IS NOT NULL AND linkedin != ''
    UNION ALL
    SELECT 'website', website WHERE website IS NOT NULL AND website != ''
  ) as social_data
  WHERE social_url IS NOT NULL
)
WHERE id IN (
  SELECT id FROM profiles
  WHERE whatsapp IS NOT NULL OR facebook IS NOT NULL OR instagram IS NOT NULL 
     OR twitter IS NOT NULL OR youtube IS NOT NULL OR tiktok IS NOT NULL 
     OR linkedin IS NOT NULL OR website IS NOT NULL
);
```

---

## 🎯 Ordre d'exécution complet

### Option A : Avec migration des données (RECOMMANDÉ)

```bash
# 1. Migrer les données AVANT de changer la structure
# → Exécutez le script de migration des données dans Supabase SQL Editor

# 2. Générer les migrations Drizzle
npm run db:generate

# 3. Pousser les changements de structure
npm run db:push

# 4. Activer RLS
# → Exécutez RLS_POLICIES_ONLY.sql dans Supabase SQL Editor
```

### Option B : Migration complète en une fois (si pas de données)

Si vous n'avez pas encore de données dans les anciennes colonnes :

```bash
# 1. Exécutez EXECUTE_THIS_IN_SUPABASE.sql dans Supabase
# → Cela fait tout : migration des données + RLS

# OU

# 1. Générer et pousser avec Drizzle
npm run db:generate
npm run db:push

# 2. Activer RLS manuellement
# → Exécutez RLS_POLICIES_ONLY.sql dans Supabase
```

---

## 🔍 Vérifier que tout fonctionne

### 1. Vérifier la structure avec Drizzle Studio
```bash
npm run db:studio
```

Cela ouvre une interface web pour explorer vos tables.

### 2. Vérifier RLS dans Supabase
1. Allez dans **Table Editor** → `profiles`
2. Vérifiez que le statut RLS indique **"Enabled"**
3. Vérifiez qu'il y a des politiques actives

### 3. Tester votre page publique
Allez sur : `https://votre-domaine.com/[username]`

Votre profil devrait maintenant s'afficher ! 🎉

---

## 🐛 Résolution de problèmes

### Erreur : "Column does not exist"
Vous avez probablement oublié d'exécuter `npm run db:push`

### Erreur : "Permission denied"
RLS n'est pas activé ou les politiques ne sont pas créées.  
→ Exécutez `RLS_POLICIES_ONLY.sql`

### Les données ont disparu
Si vous aviez des données dans les anciennes colonnes et que vous avez fait `db:push` avant de migrer :
1. Les données ne sont PAS perdues, elles sont juste dans les anciennes colonnes
2. Restaurez les colonnes temporairement
3. Exécutez le script de migration des données
4. Refaites `db:push`

### DATABASE_URL invalide
Vérifiez que :
- Le mot de passe est correct
- Le format est : `postgresql://postgres:[PASSWORD]@[REF].supabase.co:5432/postgres`
- Il n'y a pas de caractères spéciaux non encodés

---

## 📚 Commandes utiles

```bash
# Générer les migrations sans les appliquer
npm run db:generate

# Pousser les changements (applique les migrations)
npm run db:push

# Ouvrir Drizzle Studio (explorer la DB)
npm run db:studio

# Tester la connexion à la DB
npm run db:test
```

---

**Besoin d'aide ?** Demandez-moi ! 🤝
