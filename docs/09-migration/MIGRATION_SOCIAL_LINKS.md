# Migration: Système dynamique de réseaux sociaux

## 📋 Résumé

Remplacement des **8 colonnes individuelles** de réseaux sociaux par un **système dynamique avec dropdown** permettant jusqu'à **4 liens** maximum.

### Avant ❌
```
Colonnes DB: whatsapp, facebook, instagram, twitter, youtube, tiktok, website
Formulaire: 7-8 champs séparés
```

### Après ✅
```
Colonne DB: social_links (JSONB array)
Formulaire: Dropdown dynamique + Bouton "Ajouter"
```

---

## 🗄️ Changements base de données

### Migration SQL créée

**Fichier:** `supabase/migrations/20250106_migrate_social_links.sql`

**Actions:**
1. ✅ Ajout colonne `social_links` (JSONB)
2. ✅ Migration automatique des données existantes
3. ✅ Suppression anciennes colonnes (whatsapp, facebook, etc.)
4. ✅ Index GIN pour performance
5. ✅ Trigger de validation (max 4 liens)
6. ✅ Script de rollback inclus

### Format de données

```json
{
  "social_links": [
    { "type": "instagram", "url": "https://instagram.com/compte" },
    { "type": "whatsapp", "url": "+33 6 12 34 56 78" },
    { "type": "linkedin", "url": "https://linkedin.com/in/compte" },
    { "type": "github", "url": "https://github.com/compte" }
  ]
}
```

### Exécuter la migration

```bash
# Via Supabase CLI
supabase db push

# Ou via Supabase Studio
# Copier-coller le contenu du fichier de migration
```

---

## 💻 Changements code

### 1. Nouveaux fichiers créés

- ✅ `lib/types/social-links.ts` - Types et constantes
- ✅ `components/features/profiles/SocialLinksManager.tsx` - Composant dropdown
- ✅ `supabase/migrations/20250106_migrate_social_links.sql` - Migration SQL

### 2. Fichiers modifiés

#### `lib/validation/profile-schemas.ts`
```typescript
// AVANT
whatsapp: z.string().optional(),
facebook: z.string().url().optional(),
instagram: z.string().optional(),
// ... 4 autres champs

// APRÈS
social_links: z.array(socialLinkSchema)
  .max(4, 'Maximum 4 liens sociaux')
  .default([])
```

#### `components/features/profiles/BaseProfileForm.tsx`
```typescript
// AVANT
<FormField name="whatsapp" ... />
<FormField name="facebook" ... />
// ... 6 autres champs

// APRÈS
<FormField name="social_links">
  <SocialLinksManager value={...} onChange={...} />
</FormField>
```

### 3. Types disponibles

Options du dropdown:
- WhatsApp
- Facebook
- Instagram  
- Twitter / X
- YouTube
- TikTok
- LinkedIn
- GitHub ⭐ (NOUVEAU)
- Website
- Autre

---

## 🎨 Nouveau composant UI

### SocialLinksManager

**Features:**
- ✅ Dropdown pour sélection du type
- ✅ Input pour URL avec placeholder contextuel
- ✅ Bouton supprimer par lien
- ✅ Bouton "Ajouter" avec compteur (X/4)
- ✅ Validation temps réel
- ✅ Exemples d'URL pour chaque type
- ✅ Icônes par réseau social

**Exemple d'utilisation:**
```tsx
<SocialLinksManager
  value={socialLinks}
  onChange={setSocialLinks}
  error={errorMessage}
/>
```

---

## 🔄 Compatibilité

### Données existantes

✅ **Migration automatique** - Les profils existants sont migrés automatiquement:

```sql
-- Exemple de migration
whatsapp: "+33612345678"     → social_links: [{ type: "whatsapp", url: "+33612345678" }]
instagram: "@moncompte"      → social_links: [{ type: "instagram", url: "@moncompte" }]
facebook: "https://fb.com/x" → social_links: [{ type: "facebook", url: "https://fb.com/x" }]
```

### API

✅ **Aucun changement requis** - L'API `POST /api/profiles` gère automatiquement le nouveau format via la validation Zod.

---

## ✅ Checklist de vérification

Après migration, vérifier:

- [ ] Migration SQL exécutée sans erreur
- [ ] Colonnes anciennes supprimées (whatsapp, facebook, etc.)
- [ ] Colonne `social_links` présente
- [ ] Index GIN créé
- [ ] Trigger de validation actif
- [ ] Formulaire affiche le nouveau composant
- [ ] Ajout/Suppression de liens fonctionne
- [ ] Limite de 4 liens respectée
- [ ] Validation des URLs fonctionne
- [ ] Sauvegarde en DB correcte
- [ ] Profils existants migrés correctement

---

## 🐛 Résolution de problèmes

### Migration échoue

```sql
-- Vérifier la structure actuelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('whatsapp', 'facebook', 'instagram', 'social_links');
```

### Données non migrées

```sql
-- Vérifier les profils avec anciennes colonnes
SELECT id, name, whatsapp, facebook, instagram 
FROM profiles 
WHERE whatsapp IS NOT NULL OR facebook IS NOT NULL;

-- Si besoin, forcer la migration pour un profil
UPDATE profiles
SET social_links = '[{"type":"instagram","url":"@compte"}]'::jsonb
WHERE id = 'profile-uuid';
```

### Rollback si nécessaire

```sql
-- Script de rollback inclus dans le fichier de migration
-- Décommenter et exécuter les lignes à la fin du fichier
```

---

## 📊 Bénéfices

### Pour les utilisateurs
- ✅ Interface plus claire et intuitive
- ✅ Ajout/suppression facile de liens
- ✅ Support de plus de réseaux (GitHub, LinkedIn)
- ✅ Validation contextuelle par type

### Pour les développeurs
- ✅ Code plus maintenable (1 composant vs 8 champs)
- ✅ Facilité d'ajout de nouveaux réseaux
- ✅ Structure de données flexible (JSONB)
- ✅ Validation centralisée

### Pour la base de données
- ✅ Moins de colonnes (1 vs 8)
- ✅ Schema plus extensible
- ✅ Requêtes JSON optimisées (index GIN)

---

## 📝 Notes importantes

1. **Limite de 4 liens** - Imposée par trigger SQL ET validation Zod
2. **Ordre préservé** - L'ordre des liens dans le tableau est respecté
3. **Backward compatible** - Migration automatique des données
4. **Type "other"** - Permet d'ajouter des réseaux non listés
5. **Validation URLs** - Patterns spécifiques par type de réseau

---

## 🚀 Déploiement

### Étapes recommandées

1. **Backup base de données**
   ```bash
   # Via Supabase dashboard ou pg_dump
   ```

2. **Tester sur staging**
   ```bash
   supabase db push --linked
   ```

3. **Vérifier migration**
   - Tester création de profil
   - Tester édition de profil existant
   - Vérifier formulaires

4. **Déployer sur production**
   ```bash
   # La migration s'exécutera automatiquement
   ```

5. **Monitoring post-déploiement**
   - Vérifier les logs Supabase
   - Tester quelques profils manuellement
   - Surveiller les erreurs

---

**Date de migration**: 2025-01-06  
**Version**: 2.0.0  
**Breaking changes**: Non (backward compatible)  
**Rollback possible**: Oui (script inclus)
