-- =====================================================
-- DATABASE QUICK FIXES
-- Apply these fixes to resolve identified issues
-- =====================================================

-- =====================================================
-- PRIORITY 1: Remove Redundant Column
-- =====================================================

-- Remove redundant 'position' column from links table
-- (order_index already exists and is being used)
ALTER TABLE links DROP COLUMN IF EXISTS position;

COMMENT ON COLUMN links.order_index IS 'Display order of link within profile (0-based index)';

-- =====================================================
-- PRIORITY 2: Add Missing Indexes
-- =====================================================

-- Index for filtering profiles by design template
CREATE INDEX IF NOT EXISTS idx_profiles_design_choice 
ON profiles(design_choice) 
WHERE design_choice IS NOT NULL;

-- Index for filtering orders by payment status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON orders(payment_status);

-- Index for filtering NFC cards by card type
CREATE INDEX IF NOT EXISTS idx_nfc_cards_card_type 
ON nfc_cards(card_type) 
WHERE card_type IS NOT NULL;

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_profiles_user_active 
ON profiles(user_id, is_active);

-- =====================================================
-- PRIORITY 3: Add JSONB Validation Functions
-- =====================================================

-- Validation function for profiles.custom_links
CREATE OR REPLACE FUNCTION validate_custom_links(links JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Must be an array
  IF jsonb_typeof(links) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Each element must have 'title' and 'url'
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(links) AS link
    WHERE NOT (link ? 'title' AND link ? 'url')
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validation function for orders.shipping_address
CREATE OR REPLACE FUNCTION validate_shipping_address(address JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Must be an object
  IF jsonb_typeof(address) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Must have required fields
  IF NOT (
    address ? 'name' AND
    address ? 'address_line1' AND
    address ? 'city' AND
    address ? 'postal_code' AND
    address ? 'country'
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validation function for card_designs.front_design and back_design
CREATE OR REPLACE FUNCTION validate_card_design(design JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Must be an object
  IF jsonb_typeof(design) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Must have background_color and text_color
  IF NOT (design ? 'background_color' AND design ? 'text_color') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PRIORITY 4: Add CHECK Constraints
-- =====================================================

-- Add validation for profiles.custom_links
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_custom_links_structure;

ALTER TABLE profiles 
ADD CONSTRAINT valid_custom_links_structure 
CHECK (validate_custom_links(custom_links));

-- Add validation for orders.shipping_address
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS valid_shipping_address_structure;

ALTER TABLE orders 
ADD CONSTRAINT valid_shipping_address_structure 
CHECK (validate_shipping_address(shipping_address));

-- Add validation for card_designs
ALTER TABLE card_designs 
DROP CONSTRAINT IF EXISTS valid_front_design_structure;

ALTER TABLE card_designs 
ADD CONSTRAINT valid_front_design_structure 
CHECK (validate_card_design(front_design));

ALTER TABLE card_designs 
DROP CONSTRAINT IF EXISTS valid_back_design_structure;

ALTER TABLE card_designs 
ADD CONSTRAINT valid_back_design_structure 
CHECK (validate_card_design(back_design));

-- =====================================================
-- PRIORITY 5: Add Documentation Comments
-- =====================================================

-- Table comments
COMMENT ON TABLE users IS 'User accounts with authentication, subscription, and profile management';
COMMENT ON TABLE profiles IS 'User profiles (multiple per user): professional, personal, or event types';
COMMENT ON TABLE links IS 'Custom links attached to profiles with click tracking analytics';
COMMENT ON TABLE cards IS 'Physical and virtual NFC business cards linking users to profiles';
COMMENT ON TABLE card_designs IS 'Visual design configuration for business cards (front and back)';
COMMENT ON TABLE orders IS 'User orders for physical NFC cards with shipping and payment tracking';
COMMENT ON TABLE payment_methods IS 'Saved payment methods for user accounts (card, mobile money, PayPal)';
COMMENT ON TABLE analytics_events IS 'Event tracking for profile views, link clicks, and interactions';
COMMENT ON TABLE dashboard_widgets IS 'User dashboard widget configuration with grid positioning';
COMMENT ON TABLE qr_redirects IS 'Dynamic QR code redirection system with analytics';
COMMENT ON TABLE qr_scans IS 'Detailed QR code scan analytics with device and location data';
COMMENT ON TABLE template_schemas IS 'Dynamic template definitions with custom field schemas (8 presets)';
COMMENT ON TABLE profile_template_data IS 'Profile-specific template field values (1:1 with profiles)';
COMMENT ON TABLE nfc_profiles IS 'NFC-specific profile configurations with social media links';
COMMENT ON TABLE nfc_cards IS 'Physical NFC card inventory with production and delivery tracking';

-- Key JSONB column comments
COMMENT ON COLUMN profiles.custom_links IS 'Array of custom links: [{title: string, url: string, icon?: string}]';
COMMENT ON COLUMN orders.shipping_address IS 'Delivery address: {name, address_line1, address_line2?, city, postal_code, country, phone}';
COMMENT ON COLUMN card_designs.front_design IS 'Front card design config: {background_color, text_color, logo_url?, elements: [{type, value?, style?, position?}]}';
COMMENT ON COLUMN card_designs.back_design IS 'Back card design config: {background_color, text_color, logo_url?, elements: [{type, value?, style?, position?}]}';
COMMENT ON COLUMN template_schemas.schema IS 'Template field definitions: {fields: [{name, type, label, placeholder?, required?, max?, options?}]}';
COMMENT ON COLUMN profile_template_data.fields IS 'Template field values: {[fieldName]: value, ...}';

-- =====================================================
-- OPTIONAL: Standardize VARCHAR Types in QR System
-- =====================================================

-- Note: These changes require careful testing as they may affect
-- existing data. Run in staging first.

-- qr_redirects: standardize text columns
-- ALTER TABLE qr_redirects ALTER COLUMN short_code TYPE VARCHAR(20);
-- ALTER TABLE qr_redirects ALTER COLUMN redirect_type TYPE VARCHAR(50);
-- ALTER TABLE qr_redirects ALTER COLUMN title TYPE VARCHAR(200);

-- qr_scans: standardize text columns
-- ALTER TABLE qr_scans ALTER COLUMN device_type TYPE VARCHAR(20);
-- ALTER TABLE qr_scans ALTER COLUMN os TYPE VARCHAR(50);
-- ALTER TABLE qr_scans ALTER COLUMN browser TYPE VARCHAR(50);
-- ALTER TABLE qr_scans ALTER COLUMN ip_address TYPE VARCHAR(45);
-- ALTER TABLE qr_scans ALTER COLUMN country TYPE VARCHAR(2);
-- ALTER TABLE qr_scans ALTER COLUMN city TYPE VARCHAR(100);
-- ALTER TABLE qr_scans ALTER COLUMN referrer TYPE VARCHAR(500);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify redundant column is removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'links' 
AND column_name IN ('position', 'order_index');

-- Verify new indexes are created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'orders', 'nfc_cards')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verify validation functions exist
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE 'validate_%'
ORDER BY proname;

-- Verify CHECK constraints are added
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'c'
AND conname LIKE 'valid_%'
ORDER BY conname;

-- Verify table comments
SELECT tablename, obj_description(oid)
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'profiles', 'links', 'cards', 'card_designs',
  'orders', 'payment_methods', 'analytics_events', 
  'dashboard_widgets', 'qr_redirects', 'qr_scans',
  'template_schemas', 'profile_template_data',
  'nfc_profiles', 'nfc_cards'
)
ORDER BY tablename;

-- =====================================================
-- ROLLBACK SCRIPT (If needed)
-- =====================================================

-- Uncomment to rollback changes

-- Re-add position column
-- ALTER TABLE links ADD COLUMN position INTEGER DEFAULT 0;

-- Drop new indexes
-- DROP INDEX IF EXISTS idx_profiles_design_choice;
-- DROP INDEX IF EXISTS idx_orders_payment_status;
-- DROP INDEX IF EXISTS idx_nfc_cards_card_type;
-- DROP INDEX IF EXISTS idx_profiles_user_active;

-- Drop validation functions
-- DROP FUNCTION IF EXISTS validate_custom_links(JSONB);
-- DROP FUNCTION IF EXISTS validate_shipping_address(JSONB);
-- DROP FUNCTION IF EXISTS validate_card_design(JSONB);

-- Drop CHECK constraints
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_custom_links_structure;
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_shipping_address_structure;
-- ALTER TABLE card_designs DROP CONSTRAINT IF EXISTS valid_front_design_structure;
-- ALTER TABLE card_designs DROP CONSTRAINT IF EXISTS valid_back_design_structure;

-- =====================================================
-- END OF QUICK FIXES
-- =====================================================

-- Run this script with:
-- psql -U postgres -d your_database -f DATABASE_QUICK_FIXES.sql
--
-- Or in Supabase Dashboard:
-- 1. Go to SQL Editor
-- 2. Copy and paste this entire file
-- 3. Run the query
-- 4. Verify results with verification queries at the end
