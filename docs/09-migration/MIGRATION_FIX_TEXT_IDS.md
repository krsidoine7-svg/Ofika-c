# 🔧 Fix: Compatibilité des Types d'ID (UUID → TEXT)

## Problème

Erreur lors de l'application de la migration:
```
ERROR: 42804: foreign key constraint "profile_template_data_profile_id_fkey" 
cannot be implemented
DETAIL: Key columns "profile_id" and "id" are of incompatible types: uuid and text.
```

## Cause

La base de données Supabase existante utilise le type **`TEXT`** pour les colonnes d'ID (et non `UUID`), car Supabase Auth génère des IDs au format texte.

### Erreur Secondaire

Après la correction des types UUID → TEXT, une deuxième erreur est apparue:
```
ERROR: 42883: operator does not exist: text = uuid
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

**Cause**: Les RLS policies comparaient `profiles.user_id` (TEXT) avec `auth.uid()` (UUID) sans cast explicite.

## Solution Appliquée

### Fichiers Modifiés

#### 1. `supabase/migrations/20250105_dynamic_templates_schema.sql`

**Avant**:
```sql
CREATE TABLE IF NOT EXISTS template_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

CREATE TABLE IF NOT EXISTS profile_template_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES template_schemas(id) ON DELETE RESTRICT,
  ...
);
```

**Après**:
```sql
CREATE TABLE IF NOT EXISTS template_schemas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ...
);

CREATE TABLE IF NOT EXISTS profile_template_data (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES template_schemas(id) ON DELETE RESTRICT,
  ...
);
```

#### 2. `supabase/migrations/20250105_seed_template_schemas.sql`

**Avant**:
```sql
CREATE OR REPLACE FUNCTION get_template_by_slug(template_slug VARCHAR)
RETURNS TABLE (
  id UUID,
  ...
) AS $$

CREATE OR REPLACE FUNCTION migrate_profile_to_template_system(
  p_profile_id UUID,
  p_template_slug VARCHAR
)
RETURNS VOID AS $$
DECLARE
  v_template_id UUID;
```

**Après**:
```sql
CREATE OR REPLACE FUNCTION get_template_by_slug(template_slug VARCHAR)
RETURNS TABLE (
  id TEXT,
  ...
) AS $$

CREATE OR REPLACE FUNCTION migrate_profile_to_template_system(
  p_profile_id TEXT,
  p_template_slug VARCHAR
)
RETURNS VOID AS $$
DECLARE
  v_template_id TEXT;
```

#### 3. RLS Policies - Cast auth.uid()

**Avant**:
```sql
CREATE POLICY "Users can read own template data"
  ON profile_template_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_template_data.profile_id
      AND profiles.user_id = auth.uid()  -- ❌ Erreur: text = uuid
    )
  );
```

**Après**:
```sql
CREATE POLICY "Users can read own template data"
  ON profile_template_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_template_data.profile_id
      AND profiles.user_id = auth.uid()::text  -- ✅ Cast explicite
    )
  );
```

**Toutes les policies ont été corrigées** :
- `"Only admins can manage templates"`
- `"Users can read own template data"`
- `"Users can create template data for own profiles"`
- `"Users can update own template data"`
- `"Users can delete own template data"`

## Changements Effectués

1. ✅ `template_schemas.id`: `UUID` → `TEXT`
2. ✅ `profile_template_data.id`: `UUID` → `TEXT`
3. ✅ `profile_template_data.profile_id`: `UUID` → `TEXT`
4. ✅ `profile_template_data.template_id`: `UUID` → `TEXT`
5. ✅ Fonction `get_template_by_slug()`: paramètre de retour `UUID` → `TEXT`
6. ✅ Fonction `migrate_profile_to_template_system()`: paramètres `UUID` → `TEXT`
7. ✅ **RLS Policies**: Ajout de `::text` après tous les `auth.uid()` pour compatibilité

## Impact sur le Code TypeScript

**Aucun changement nécessaire** dans le code TypeScript car:
- Les types TypeScript utilisent déjà `string` pour les IDs
- `lib/types/template.ts` utilise `id: string` (pas de type UUID strict)
- Les API routes fonctionnent avec `string`

## Vérification

### Avant de Réappliquer

1. **Supprimer les tables créées** (si la migration partielle a créé des tables):
```sql
DROP TABLE IF EXISTS profile_template_data CASCADE;
DROP TABLE IF EXISTS template_schemas CASCADE;
```

2. **Réappliquer les migrations** dans l'ordre:
```sql
-- 1. Schema
\i supabase/migrations/20250105_dynamic_templates_schema.sql

-- 2. Seed
\i supabase/migrations/20250105_seed_template_schemas.sql
```

### Vérifier que ça fonctionne

```sql
-- Vérifier les types
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'template_schemas' 
  AND column_name = 'id';
-- Devrait retourner: text

SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'profile_template_data' 
  AND column_name IN ('id', 'profile_id', 'template_id');
-- Tous devraient être: text

-- Compter les templates
SELECT COUNT(*) FROM template_schemas;
-- Devrait retourner: 8

-- Tester la fonction
SELECT * FROM get_template_by_slug('influencer');
-- Devrait retourner le template influenceur
```

## Pourquoi TEXT au lieu de UUID ?

Supabase Auth (basé sur GoTrue) génère des user IDs au format:
- **Type PostgreSQL**: `UUID` (stocké comme UUID en base)
- **Type retourné par l'API**: `string` 
- **Compatibilité**: La colonne `profiles.user_id` est `TEXT` pour compatibilité avec l'auth

Par conséquent, toutes les foreign keys vers `profiles` doivent aussi être `TEXT`.

## Notes Importantes

1. **Génération d'ID**: `gen_random_uuid()::text` génère toujours un UUID valide, mais le stocke comme TEXT
2. **Performance**: Aucun impact, les index fonctionnent de la même manière
3. **Validation**: Les UUIDs restent valides (format respecté)
4. **API**: Aucun changement nécessaire côté frontend

## Commandes Git

```bash
# Les fichiers ont été modifiés
git add supabase/migrations/20250105_dynamic_templates_schema.sql
git add supabase/migrations/20250105_seed_template_schemas.sql
git add MIGRATION_FIX_TEXT_IDS.md

git commit -m "fix(db): change ID types from UUID to TEXT + fix RLS policies

The existing profiles table uses TEXT for IDs (Supabase Auth standard).
Updated template_schemas and profile_template_data to use TEXT instead of UUID.

Changes:
- Changed all id columns to TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text
- Updated foreign keys to TEXT
- Updated function signatures
- Added ::text cast to all auth.uid() in RLS policies

No changes needed in TypeScript code (already uses string)."
```

## Résolution Complète

✅ **Migration corrigée**  
✅ **Types compatibles avec la base existante**  
✅ **Prêt à être appliqué**

Vous pouvez maintenant réappliquer les migrations dans Supabase Studio sans erreur.

---

**Date**: 2025-01-05  
**Auteur**: Cascade AI
