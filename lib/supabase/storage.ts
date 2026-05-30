// Configuration des buckets Supabase Storage

export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  CARD_DESIGNS: 'card-designs',
  TEMP_UPLOADS: 'temp-uploads'
} as const

export const STORAGE_PATHS = {
  PROFILE_IMAGES: 'profile-images',
  CARD_DESIGNS: 'card-designs',
  TEMP_UPLOADS: 'temp-uploads'
} as const

// Politiques de stockage recommandées pour Supabase
export const STORAGE_POLICIES = {
  // Politique pour les images de profil - lecture publique
  PROFILE_IMAGES_READ: `
    CREATE POLICY "Public read access for profile images" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');
  `,
  
  // Politique pour les images de profil - écriture pour les utilisateurs authentifiés
  PROFILE_IMAGES_WRITE: `
    CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'profile-images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `,
  
  // Politique pour les images de profil - mise à jour pour les propriétaires
  PROFILE_IMAGES_UPDATE: `
    CREATE POLICY "Users can update their own profile images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'profile-images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `,
  
  // Politique pour les images de profil - suppression pour les propriétaires
  PROFILE_IMAGES_DELETE: `
    CREATE POLICY "Users can delete their own profile images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'profile-images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `
} as const

// Configuration des types de fichiers autorisés
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB en bytes

// Fonction utilitaire pour valider les images
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Type de fichier non supporté. Formats acceptés: JPG, PNG, GIF, WebP'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  return { valid: true }
}
