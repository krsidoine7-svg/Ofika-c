-- =====================================================
-- MIGRATION: Système de Templates Dynamiques
-- Date: 2025-01-05
-- Description: Ajoute les tables pour gérer les templates
-- et leurs champs spécifiques
-- =====================================================

-- Table pour stocker les schémas de templates
CREATE TABLE IF NOT EXISTS template_schemas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50),
  icon VARCHAR(50),
  priority_label VARCHAR(50),
  target_audience TEXT,
  features TEXT[],
  stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT valid_version CHECK (version > 0)
);

-- Table pour stocker les données spécifiques aux templates pour chaque profil
CREATE TABLE IF NOT EXISTS profile_template_data (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES template_schemas(id) ON DELETE RESTRICT,
  fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un profil ne peut avoir qu'un seul template actif
  UNIQUE(profile_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_template_schemas_slug ON template_schemas(slug);
CREATE INDEX IF NOT EXISTS idx_template_schemas_active ON template_schemas(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profile_template_data_profile ON profile_template_data(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_template_data_template ON profile_template_data(template_id);

-- Index GIN pour les recherches JSON
CREATE INDEX IF NOT EXISTS idx_template_schemas_schema ON template_schemas USING GIN (schema);
CREATE INDEX IF NOT EXISTS idx_profile_template_data_fields ON profile_template_data USING GIN (fields);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_schemas_updated_at
  BEFORE UPDATE ON template_schemas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_template_data_updated_at
  BEFORE UPDATE ON profile_template_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour template_schemas (lecture publique, écriture admin)
ALTER TABLE template_schemas ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les templates actifs
CREATE POLICY "Anyone can read active templates"
  ON template_schemas FOR SELECT
  USING (is_active = true);

-- Seulement les admins peuvent créer/modifier/supprimer
CREATE POLICY "Only admins can manage templates"
  ON template_schemas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.subscription_tier = 'admin'
    )
  );

-- RLS Policies pour profile_template_data
ALTER TABLE profile_template_data ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leurs propres données
CREATE POLICY "Users can read own template data"
  ON profile_template_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_template_data.profile_id
      AND profiles.user_id = auth.uid()::text
    )
  );

-- Les utilisateurs peuvent créer des données pour leurs profils
CREATE POLICY "Users can create template data for own profiles"
  ON profile_template_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_template_data.profile_id
      AND profiles.user_id = auth.uid()::text
    )
  );

-- Les utilisateurs peuvent modifier leurs propres données
CREATE POLICY "Users can update own template data"
  ON profile_template_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_template_data.profile_id
      AND profiles.user_id = auth.uid()::text
    )
  );

-- Les utilisateurs peuvent supprimer leurs propres données
CREATE POLICY "Users can delete own template data"
  ON profile_template_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_template_data.profile_id
      AND profiles.user_id = auth.uid()::text
    )
  );

-- Fonction helper pour valider le schema JSON d'un template
CREATE OR REPLACE FUNCTION validate_template_schema(schema_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que le schema contient un tableau "fields"
  IF NOT (schema_json ? 'fields') THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier que "fields" est un tableau
  IF jsonb_typeof(schema_json->'fields') != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier que chaque field a au minimum name, type, label
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(schema_json->'fields') AS field
    WHERE NOT (field ? 'name' AND field ? 'type' AND field ? 'label')
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Contrainte pour valider le schema
ALTER TABLE template_schemas
  ADD CONSTRAINT valid_schema_structure
  CHECK (validate_template_schema(schema));

COMMENT ON TABLE template_schemas IS 'Stocke les définitions de templates avec leurs champs dynamiques';
COMMENT ON TABLE profile_template_data IS 'Stocke les valeurs des champs spécifiques à chaque template pour chaque profil';
COMMENT ON COLUMN template_schemas.schema IS 'Structure JSON définissant les champs du template';
COMMENT ON COLUMN profile_template_data.fields IS 'Valeurs JSON des champs du template pour ce profil';
