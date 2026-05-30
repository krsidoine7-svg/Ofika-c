# 📊 Mises à jour de la base de données Supabase

## ✅ Champs déjà existants dans la table `profiles`

Ces champs sont déjà présents et fonctionnels :
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key vers auth.users)
- `name` (text)
- `profile_type` (text)
- `bio` (text)
- `image_url` (text)
- `custom_url` (text)
- `username` (text)
- `email` (text)
- `phone` (text)
- `whatsapp` (text)
- `facebook` (text)
- `instagram` (text)
- `twitter` (text)
- `youtube` (text)
- `tiktok` (text)
- `website` (text)
- `custom_links` (jsonb)
- `design_choice` (text)
- `color_theme` (text)
- `is_public` (boolean)
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 🆕 Nouveaux champs à ajouter

### 1. Photo de couverture
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
```

**Description** : URL de la photo de couverture pour les designs qui le supportent (Classique, Nature, Influenceur, E-commerce, Freelance)

**Type** : TEXT (URL)

**Nullable** : Oui (optionnel)

---

### 2. LinkedIn
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS linkedin TEXT;
```

**Description** : URL du profil LinkedIn (spécifiquement pour le design Freelance)

**Type** : TEXT (URL)

**Nullable** : Oui (optionnel)

---

## 📋 Script SQL complet pour Supabase

Copiez et exécutez ce script dans l'éditeur SQL de Supabase :

```sql
-- ============================================
-- AJOUT DES NOUVEAUX CHAMPS
-- ============================================

-- Ajouter la colonne cover_image_url
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Ajouter la colonne linkedin
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- ============================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- ============================================

COMMENT ON COLUMN profiles.cover_image_url IS 'URL de la photo de couverture (1200x400px recommandé)';
COMMENT ON COLUMN profiles.linkedin IS 'URL du profil LinkedIn';

-- ============================================
-- INDEX POUR OPTIMISATION (OPTIONNEL)
-- ============================================

-- Index sur username pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Index sur custom_url pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_profiles_custom_url ON profiles(custom_url);

-- Index sur user_id pour filtrage par utilisateur
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- POLITIQUE DE SÉCURITÉ (RLS)
-- ============================================

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les profils publics
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (is_public = true AND is_active = true);

-- Politique de lecture pour l'utilisateur propriétaire
CREATE POLICY IF NOT EXISTS "Users can view their own profiles"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Politique de création pour les utilisateurs authentifiés
CREATE POLICY IF NOT EXISTS "Users can create their own profiles"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour pour l'utilisateur propriétaire
CREATE POLICY IF NOT EXISTS "Users can update their own profiles"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Politique de suppression pour l'utilisateur propriétaire
CREATE POLICY IF NOT EXISTS "Users can delete their own profiles"
ON profiles FOR DELETE
USING (auth.uid() = user_id);
```

---

## 🔍 Vérification après exécution

Pour vérifier que les colonnes ont bien été ajoutées, exécutez :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('cover_image_url', 'linkedin')
ORDER BY column_name;
```

Résultat attendu :
```
column_name       | data_type | is_nullable
------------------|-----------|-------------
cover_image_url   | text      | YES
linkedin          | text      | YES
```

---

## 📊 Structure complète de la table `profiles`

Après les modifications, voici la structure complète :

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | uuid | NO | Identifiant unique |
| user_id | uuid | NO | Référence vers auth.users |
| name | text | NO | Nom complet |
| profile_type | text | YES | Type de profil (professional/personal/event) |
| bio | text | YES | Description/Bio (max 200 caractères) |
| image_url | text | YES | Photo de profil |
| **cover_image_url** | **text** | **YES** | **Photo de couverture (NOUVEAU)** |
| custom_url | text | YES | URL personnalisée |
| username | text | YES | Nom d'utilisateur unique |
| email | text | YES | Email de contact |
| phone | text | YES | Numéro de téléphone |
| whatsapp | text | YES | URL WhatsApp |
| facebook | text | YES | URL Facebook |
| instagram | text | YES | URL Instagram |
| twitter | text | YES | URL Twitter |
| youtube | text | YES | URL YouTube |
| tiktok | text | YES | URL TikTok |
| **linkedin** | **text** | **YES** | **URL LinkedIn (NOUVEAU)** |
| website | text | YES | Site web |
| custom_links | jsonb | YES | Liens personnalisés |
| design_choice | text | YES | Design choisi |
| color_theme | text | YES | Thème de couleur |
| is_public | boolean | YES | Profil public/privé |
| is_active | boolean | YES | Profil actif/inactif |
| created_at | timestamp | YES | Date de création |
| updated_at | timestamp | YES | Date de mise à jour |

---

## 🎯 Designs utilisant les nouveaux champs

### Photo de couverture (`cover_image_url`)
- ✅ Design Classique (design1)
- ✅ Design Nature (design4)
- ✅ Design Influenceur (influencer)
- ✅ Design E-commerce (ecommerce)
- ✅ Design Freelance (freelance)

### LinkedIn (`linkedin`)
- ✅ Design Freelance (freelance)

---

## 🔄 Migration des données existantes (si nécessaire)

Si vous avez des profils existants et que vous voulez ajouter des valeurs par défaut :

```sql
-- Mettre NULL par défaut pour les nouveaux champs (déjà fait automatiquement)
-- Aucune migration nécessaire car les champs sont optionnels
```

---

## ✅ Checklist de validation

Après avoir exécuté le script SQL, vérifiez :

- [ ] Les colonnes `cover_image_url` et `linkedin` existent
- [ ] Les colonnes acceptent NULL (optionnelles)
- [ ] Les index sont créés pour optimiser les recherches
- [ ] Les politiques RLS sont actives
- [ ] Les profils existants ne sont pas affectés
- [ ] Le formulaire de création fonctionne avec les nouveaux champs
- [ ] Les designs affichent correctement la photo de couverture

---

## 📝 Notes importantes

1. **Validation des URLs** : La validation des URLs se fait côté frontend avec Zod. Côté base de données, ce sont de simples TEXT.

2. **Taille des images** : 
   - Photo de profil : Recommandé 400x400px
   - Photo de couverture : Recommandé 1200x400px

3. **Stockage des images** : Les URLs pointent vers Supabase Storage ou un service externe (Cloudinary, etc.)

4. **Performance** : Les index créés optimisent les recherches par username et custom_url

5. **Sécurité** : Les politiques RLS garantissent que seul le propriétaire peut modifier son profil

---

## 🚀 Prochaines étapes

1. Exécuter le script SQL dans Supabase
2. Vérifier que les colonnes sont créées
3. Tester la création d'un profil avec les nouveaux champs
4. Vérifier l'affichage des photos de couverture dans les designs
5. Tester le lien LinkedIn dans le design Freelance

---

## 🆘 En cas de problème

Si vous rencontrez des erreurs :

1. **Erreur "column already exists"** : Normal si vous avez déjà ajouté les colonnes. Ignorez l'erreur.

2. **Erreur de permissions** : Assurez-vous d'être connecté en tant qu'admin Supabase.

3. **Erreur RLS** : Vérifiez que les politiques ne sont pas en conflit avec des politiques existantes.

Pour supprimer les colonnes (si besoin de recommencer) :
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS cover_image_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS linkedin;
```

---

**Date de création** : 2025-01-31  
**Version** : 1.0  
**Auteur** : Assistant IA
