# Migration: Réseaux Sociaux avec Liste Déroulante

## Description
Cette migration ajoute une nouvelle colonne `social_links` à la table `profiles` pour permettre aux utilisateurs d'ajouter plusieurs réseaux sociaux via une liste déroulante.

## Changements

### Base de données
- **Nouvelle colonne**: `social_links` (JSONB)
  - Stocke un tableau de réseaux sociaux
  - Structure: `[{"platform": "whatsapp", "url": "https://..."}]`
  - Plateformes supportées: whatsapp, facebook, instagram, twitter, youtube, tiktok, linkedin, snapchat, telegram, website

### Frontend
- **Formulaire de profil** (`ProfileForm.tsx`)
  - Nouvelle section "Réseaux Sociaux" avec liste déroulante
  - Affichage numéroté des réseaux sociaux ajoutés
  - Possibilité d'ajouter/supprimer des réseaux sociaux
  - Icônes colorées pour chaque plateforme

### Validation
- **Schema Zod** (`lib/validations.ts`)
  - Nouveau champ `social_links` avec validation
  - Validation de l'URL pour chaque réseau social
  - Enum pour les plateformes supportées

## Installation

### 1. Exécuter la migration SQL
Connectez-vous à votre base de données Supabase et exécutez le fichier:
```sql
-- Exécuter le fichier add-social-links-column.sql
```

Ou via l'interface Supabase:
1. Allez dans SQL Editor
2. Copiez le contenu de `add-social-links-column.sql`
3. Exécutez la requête

### 2. Vérifier la migration
La migration affichera un message de confirmation:
- ✅ "Colonne social_links ajoutée avec succès"
- ℹ️ "La colonne social_links existe déjà" (si déjà exécutée)

## Utilisation

### Pour les utilisateurs
1. Accédez au formulaire de création/édition de profil
2. Dans la section "Réseaux Sociaux":
   - Cliquez sur "Ajouter un réseau social"
   - Sélectionnez la plateforme dans la liste déroulante
   - Entrez l'URL du profil
   - Validez
3. Les réseaux sociaux s'affichent numérotés (1, 2, 3, ...)
4. Vous pouvez supprimer un réseau social en cliquant sur l'icône poubelle

### Pour les développeurs
Le champ `social_links` est automatiquement géré par le formulaire et stocké en JSONB dans la base de données.

Structure des données:
```typescript
social_links: Array<{
  platform: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'snapchat' | 'telegram' | 'website'
  url: string
}>
```

## Compatibilité
- ✅ Les anciens champs individuels (whatsapp, facebook, etc.) sont conservés pour la compatibilité
- ✅ Les profils existants ne sont pas affectés
- ✅ Migration réversible (la colonne peut être supprimée sans impact)

## Notes
- La migration est idempotente (peut être exécutée plusieurs fois sans erreur)
- Les anciennes colonnes individuelles sont conservées pour la rétrocompatibilité
- Le nouveau système `social_links` est recommandé pour tous les nouveaux profils
