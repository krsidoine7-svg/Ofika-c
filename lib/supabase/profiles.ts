import { createClient } from './server';
import { VCardProfile } from '@/lib/vcard-generator';

export async function getProfileByUsername(username: string): Promise<VCardProfile | null> {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      bio,
      image_url,
      email,
      phone,
      company,
      title,
      social_links,
      custom_links
    `)
    .eq('username', username)
    .eq('is_public', true)
    .eq('is_active', true)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    company: profile.company,
    title: profile.title,
    bio: profile.bio,
    social_links: profile.social_links
  };
}
