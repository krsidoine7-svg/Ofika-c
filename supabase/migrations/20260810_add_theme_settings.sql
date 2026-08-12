-- Migration to add theme_settings to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{}'::jsonb;
