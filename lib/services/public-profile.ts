import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { PublicProfile } from '@/lib/types/public-profile';

/**
 * Récupère un profil public avec mise en cache Next.js
 * @param username Le nom d'utilisateur ou l'URL personnalisée
 * @returns Le profil public ou null
 */
export const getPublicProfile = unstable_cache(
  async (username: string): Promise<PublicProfile | null> => {
    const supabase = createPublicClient();

    // 1. Chercher dans la table profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id, name, bio, image_url, cover_image_url, custom_url, username, email, phone,
        social_links, custom_links, design_choice, color_theme, is_public, is_active,
        suspension_reason, created_at,
        instagram_followers, instagram_posts, instagram_verified,
        ig_show_followers, ig_show_posts, ig_show_verified,
        tiktok_followers, tiktok_posts, tiktok_verified,
        tt_show_followers, tt_show_posts, tt_show_verified,
        youtube_subscribers, youtube_videos, youtube_verified,
        yt_show_subscribers, yt_show_videos, yt_show_verified,
        twitter_followers, twitter_posts, twitter_verified,
        tw_show_followers, tw_show_posts, tw_show_verified,
        facebook_followers, facebook_verified,
        fb_show_followers, fb_show_verified
      `)
      .or(`username.eq.${username},custom_url.eq.${username}`)
      .eq('is_public', true)
      .eq('is_active', true)
      .maybeSingle();

    if (profileData && !profileError) {
      // Vérifier si ce profil est associé à une carte NFC
      const { data: nfcAssociation } = await supabase
        .from('digital_nfc_cards')
        .select('id')
        .eq('profile_id', profileData.id)
        .eq('status', 'active')
        .maybeSingle();

      return {
        ...profileData,
        id: profileData.id,
        profile_name: profileData.name,
        nfc_link: `https://ofika.com/${profileData.custom_url || profileData.username}`,
        design_choice: profileData.design_choice || 'design1',
        color_theme: profileData.color_theme || 'default',
        status: 'active',
        created_at: profileData.created_at,
        is_nfc_associated: !!nfcAssociation,
        full_name: profileData.name,
        bio: profileData.bio || '',
        phone: profileData.phone,
        email: profileData.email,
        image_url: profileData.image_url,
        cover_image_url: profileData.cover_image_url || undefined,
        social_links: (profileData.social_links as any[]) || [],
        custom_links: (profileData.custom_links as any[]) || [],
        is_active: profileData.is_active,
        suspension_reason: profileData.suspension_reason
      };
    }

    // 2. Si pas trouvé dans profiles, chercher dans digital_nfc_cards
    const { data: nfcData, error: nfcError } = await supabase
      .from('digital_nfc_cards')
      .select(`
        id, profile_name, nfc_link, design_choice, color_theme, status, created_at,
        full_name, company, job_title, bio, phone, email, instagram, twitter, facebook,
        whatsapp, youtube, tiktok, linkedin, other_links, location, username, custom_url,
        logo_url, profile_photo_url, custom_links, cover_image_url
      `)
      .or(`username.eq.${username},custom_url.eq.${username}`)
      .eq('status', 'active')
      .eq('is_active', true)
      .maybeSingle();

    if (nfcData && !nfcError) {
      return {
        id: nfcData.id,
        profile_name: nfcData.profile_name,
        nfc_link: nfcData.nfc_link,
        design_choice: nfcData.design_choice || 'design1',
        color_theme: nfcData.color_theme || 'default',
        status: nfcData.status,
        created_at: nfcData.created_at,
        is_nfc_associated: true,
        full_name: nfcData.full_name,
        company: nfcData.company,
        job_title: nfcData.job_title,
        bio: nfcData.bio || '',
        phone: nfcData.phone,
        email: nfcData.email,
        instagram: nfcData.instagram || '',
        linkedin: nfcData.linkedin || '',
        twitter: nfcData.twitter || '',
        facebook: nfcData.facebook || '',
        whatsapp: nfcData.whatsapp || '',
        youtube: nfcData.youtube || '',
        tiktok: nfcData.tiktok || '',
        website: nfcData.other_links || '',
        location: nfcData.location || '',
        image_url: nfcData.profile_photo_url || nfcData.logo_url,
        cover_image_url: nfcData.cover_image_url || undefined,
        custom_links: (nfcData.custom_links as any[]) || [],
        is_active: true
      };
    }

    return null;
  },
  ['public-profile'],
  {
    revalidate: 3600, // Mise en cache pour 1 heure
    tags: ['public-profile']
  }
);

/**
 * Invalide le cache pour un profil spécifique
 * @param username Le nom d'utilisateur ou l'URL personnalisée
 */
export async function revalidateProfile(username: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('public-profile');
  // Note: Comme username peut être soit le username soit le custom_url,
  // et qu'on ne sait pas forcément lequel est utilisé ici, 
  // on invalide le tag global pour l'instant.
  // Pour être plus précis, on pourrait ajouter des tags spécifiques lors du fetch.
}
