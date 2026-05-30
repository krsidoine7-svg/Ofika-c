-- =====================================================
-- SEED: Templates Initiaux
-- Date: 2025-01-05
-- Description: Peuple la table template_schemas avec les 8 templates de base
-- =====================================================

-- Template 1: Design Classique (Professionnel)
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design Classique',
  'design1',
  'Layout vertical épuré et professionnel',
  'professional',
  'Palette',
  'Professionnel',
  'Professionnels & Entreprises',
  ARRAY['Layout vertical', 'Design épuré', 'Style professionnel', 'Facile à lire'],
  '{"users": "65%", "satisfaction": "4.8/5", "conversion": "+12%"}'::jsonb,
  '{
    "fields": [
      {
        "name": "company",
        "type": "text",
        "label": "Entreprise",
        "placeholder": "Nom de votre entreprise",
        "required": false,
        "max": 100
      },
      {
        "name": "position",
        "type": "text",
        "label": "Poste",
        "placeholder": "Votre fonction",
        "required": false,
        "max": 100
      },
      {
        "name": "linkedin",
        "type": "url",
        "label": "LinkedIn",
        "placeholder": "https://linkedin.com/in/votre-profil",
        "required": false
      }
    ]
  }'::jsonb
);

-- Template 2: Design
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design',
  'design2',
  'Grille de cartes avec effets interactifs',
  'creative',
  'Star',
  'Populaire',
  'Créatifs & Designers',
  ARRAY['Grille de cartes', 'Effets hover', 'Icônes colorées', 'Design interactif'],
  '{"users": "25%", "satisfaction": "4.6/5", "conversion": "+8%"}'::jsonb,
  '{
    "fields": [
      {
        "name": "portfolio_url",
        "type": "url",
        "label": "Portfolio",
        "placeholder": "https://votreportfolio.com",
        "required": false
      },
      {
        "name": "behance",
        "type": "url",
        "label": "Behance",
        "placeholder": "https://behance.net/votre-profil",
        "required": false
      },
      {
        "name": "dribbble",
        "type": "url",
        "label": "Dribbble",
        "placeholder": "https://dribbble.com/votre-profil",
        "required": false
      }
    ]
  }'::jsonb
);

-- Template 3: Design Créatif
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design Créatif',
  'design3',
  'Effets visuels et animations avancées',
  'creative',
  'Sparkles',
  'Premium',
  'Artistes & Créatifs',
  ARRAY['Fond dégradé animé', 'Glassmorphism', 'Animations avancées', 'Design unique'],
  '{"users": "10%", "satisfaction": "4.9/5", "conversion": "+15%"}'::jsonb,
  '{
    "fields": [
      {
        "name": "art_style",
        "type": "text",
        "label": "Style artistique",
        "placeholder": "ex: Digital art, Photography, Illustration",
        "required": false,
        "max": 100
      },
      {
        "name": "available_for_commissions",
        "type": "boolean",
        "label": "Disponible pour des commissions",
        "required": false
      }
    ]
  }'::jsonb
);

-- Template 4: Design Nature
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design Nature',
  'design4',
  'Style minimaliste avec couleurs naturelles',
  'minimal',
  'Award',
  'Nouveau',
  'Minimalistes & Écologiques',
  ARRAY['Couleurs naturelles', 'Style minimaliste', 'Header coloré', 'Design moderne'],
  '{"users": "5%", "satisfaction": "4.7/5", "conversion": "+10%"}'::jsonb,
  '{
    "fields": []
  }'::jsonb
);

-- Template 5: Design Influenceur
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design Influenceur',
  'influencer',
  'Optimisé pour créateurs de contenu et influenceurs',
  'influencer',
  'Users',
  'Tendance',
  'Influenceurs & Créateurs',
  ARRAY['Mise en avant réseaux sociaux', 'Grille photo/vidéo', 'Boutons d''action visibles', 'Design accrocheur'],
  '{"users": "15%", "satisfaction": "4.8/5", "conversion": "+18%"}'::jsonb,
  '{
    "fields": [
      {
        "name": "instagram_followers",
        "type": "number",
        "label": "Followers Instagram",
        "placeholder": "Nombre de followers",
        "required": false,
        "min": 0,
        "import_source": "instagram_oauth"
      },
      {
        "name": "tiktok_followers",
        "type": "number",
        "label": "Followers TikTok",
        "placeholder": "Nombre de followers",
        "required": false,
        "min": 0,
        "import_source": "tiktok_oauth"
      },
      {
        "name": "youtube_subscribers",
        "type": "number",
        "label": "Abonnés YouTube",
        "placeholder": "Nombre d''abonnés",
        "required": false,
        "min": 0,
        "import_source": "youtube_oauth"
      },
      {
        "name": "content_category",
        "type": "select",
        "label": "Catégorie de contenu",
        "placeholder": "Sélectionnez votre catégorie",
        "required": false,
        "options": ["Lifestyle", "Mode", "Beauté", "Tech", "Gaming", "Food", "Travel", "Fitness", "Business", "Education", "Entertainment", "Autre"]
      },
      {
        "name": "collaboration_email",
        "type": "email",
        "label": "Email pour collaborations",
        "placeholder": "contact@exemple.com",
        "required": false
      }
    ]
  }'::jsonb
);

-- Template 6: Design E-commerce
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design E-commerce',
  'ecommerce',
  'Parfait pour vendeurs en ligne et boutiques',
  'business',
  'Crown',
  'Business',
  'Vendeurs & E-commerçants',
  ARRAY['Mise en avant produits', 'Boutons d''achat', 'Catalogue visuel', 'Call-to-action optimisés'],
  '{"users": "12%", "satisfaction": "4.7/5", "conversion": "+22%"}'::jsonb,
  '{
    "fields": [
      {
        "name": "store_url",
        "type": "url",
        "label": "URL de la boutique",
        "placeholder": "https://votreboutique.com",
        "required": false
      },
      {
        "name": "product_categories",
        "type": "textarea",
        "label": "Catégories de produits",
        "placeholder": "ex: Vêtements, Accessoires, Électronique",
        "required": false,
        "max": 200
      },
      {
        "name": "payment_methods",
        "type": "text",
        "label": "Moyens de paiement acceptés",
        "placeholder": "ex: Mobile Money, Carte bancaire, PayPal",
        "required": false,
        "max": 150
      },
      {
        "name": "shipping_countries",
        "type": "text",
        "label": "Pays de livraison",
        "placeholder": "ex: France, Belgique, Suisse, Afrique de l''Ouest",
        "required": false,
        "max": 150
      },
      {
        "name": "whatsapp_order",
        "type": "text",
        "label": "WhatsApp pour commandes",
        "placeholder": "+33612345678",
        "required": false,
        "validation": "^\\+?[0-9\\s-]+$"
      }
    ]
  }'::jsonb
);

-- Template 7: Design Dark Elegant
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design Dark Elegant',
  'design7',
  'Design sombre élégant avec fond dégradé',
  'premium',
  'Star',
  'Premium',
  'Créatifs & Photographes',
  ARRAY['Fond sombre élégant', 'Photo circulaire centrée', 'Boutons blancs minimalistes', 'Design haut de gamme'],
  '{"users": "8%", "satisfaction": "4.9/5", "conversion": "+20%"}'::jsonb,
  '{
    "fields": [
      {
        "name": "photography_style",
        "type": "text",
        "label": "Style de photographie",
        "placeholder": "ex: Portrait, Paysage, Mode, Événementiel",
        "required": false,
        "max": 100
      },
      {
        "name": "photography_website",
        "type": "url",
        "label": "Site portfolio photo",
        "placeholder": "https://votre-portfolio.com",
        "required": false
      },
      {
        "name": "booking_url",
        "type": "url",
        "label": "Lien de réservation",
        "placeholder": "https://calendly.com/votre-lien",
        "required": false
      }
    ]
  }'::jsonb
);

-- Template 8: Design Freelance
INSERT INTO template_schemas (name, slug, description, category, icon, priority_label, target_audience, features, stats, schema)
VALUES (
  'Design Freelance',
  'freelance',
  'Optimisé pour freelances et solopreneurs africains',
  'business',
  'Users',
  'Professionnel',
  'Freelances & Solopreneurs',
  ARRAY['Palette chaleureuse', 'CTA orange puissant', 'Social proof intégré', 'Design confiance'],
  '{"users": "18%", "satisfaction": "4.8/5", "conversion": "+16%"}'::jsonb,
  '{
    "fields": [
      {
        "name": "services_offered",
        "type": "textarea",
        "label": "Services proposés",
        "placeholder": "ex: Développement web, Design graphique, Consulting",
        "required": false,
        "max": 300
      },
      {
        "name": "hourly_rate",
        "type": "text",
        "label": "Tarif horaire",
        "placeholder": "ex: 50-100€/h ou sur devis",
        "required": false,
        "max": 50
      },
      {
        "name": "years_experience",
        "type": "number",
        "label": "Années d''expérience",
        "placeholder": "Nombre d''années",
        "required": false,
        "min": 0,
        "max": 50
      },
      {
        "name": "clients_count",
        "type": "number",
        "label": "Nombre de clients satisfaits",
        "placeholder": "ex: 25",
        "required": false,
        "min": 0
      },
      {
        "name": "projects_completed",
        "type": "number",
        "label": "Projets complétés",
        "placeholder": "ex: 50",
        "required": false,
        "min": 0
      },
      {
        "name": "availability",
        "type": "select",
        "label": "Disponibilité",
        "placeholder": "Votre disponibilité",
        "required": false,
        "options": ["Disponible immédiatement", "Disponible sous 1 semaine", "Disponible sous 2 semaines", "Complet pour le moment"]
      }
    ]
  }'::jsonb
);

-- Créer des vues pour faciliter les requêtes
CREATE OR REPLACE VIEW v_templates_with_field_count AS
SELECT 
  id,
  name,
  slug,
  description,
  category,
  priority_label,
  target_audience,
  jsonb_array_length(schema->'fields') AS field_count,
  is_active,
  created_at
FROM template_schemas
ORDER BY name;

COMMENT ON VIEW v_templates_with_field_count IS 'Vue pratique listant les templates avec le nombre de champs';

-- Fonction helper pour obtenir un template par slug
CREATE OR REPLACE FUNCTION get_template_by_slug(template_slug VARCHAR)
RETURNS TABLE (
  id TEXT,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  schema JSONB,
  category VARCHAR,
  features TEXT[],
  stats JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.name,
    ts.slug,
    ts.description,
    ts.schema,
    ts.category,
    ts.features,
    ts.stats
  FROM template_schemas ts
  WHERE ts.slug = template_slug
    AND ts.is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour migrer un profil existant vers le nouveau système
CREATE OR REPLACE FUNCTION migrate_profile_to_template_system(
  p_profile_id TEXT,
  p_template_slug VARCHAR
)
RETURNS VOID AS $$
DECLARE
  v_template_id TEXT;
  v_design_choice VARCHAR;
BEGIN
  -- Récupérer l'ID du template
  SELECT id INTO v_template_id
  FROM template_schemas
  WHERE slug = p_template_slug
    AND is_active = true;
  
  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'Template % not found', p_template_slug;
  END IF;
  
  -- Mettre à jour le design_choice du profil
  UPDATE profiles
  SET design_choice = p_template_slug,
      updated_at = NOW()
  WHERE id = p_profile_id;
  
  -- Créer l'entrée profile_template_data si elle n'existe pas
  INSERT INTO profile_template_data (profile_id, template_id, fields)
  VALUES (p_profile_id, v_template_id, '{}'::jsonb)
  ON CONFLICT (profile_id) DO NOTHING;
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION migrate_profile_to_template_system IS 'Migre un profil existant vers le système de templates dynamiques';
