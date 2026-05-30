import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


export async function GET(
  request: NextRequest,
  { params }: { params: { nfcLink: string } }
) {
  try {
    const supabase = await createClient()
    const { nfcLink } = params

    // Récupérer la carte NFC par son lien en cherchant dans le JSON structuré
    const { data: searchCard, error: searchError } = await supabase
        .from('digital_nfc_cards')
        .select('*')
        .or(`nfc_link.eq.https://ofika.com/${nfcLink},preview_data->>nfc_link.eq.https://ofika.com/${nfcLink}`)
        .eq('status', 'active')
        .single()
        
    if (searchError || !searchCard) {
      return NextResponse.json(
        { error: 'Carte NFC non trouvée' },
        { status: 404 }
      )
    }

    // Reconstruction du profil public à partir de preview_data
    const p = searchCard.preview_data || {}
    const publicProfile = {
      id: searchCard.id,
      profile_name: searchCard.profile_name || p.profile_name,
      nfc_link: searchCard.nfc_link || p.nfc_link,
      design_choice: searchCard.design_choice || 'design-classic',
      color_theme: searchCard.color_theme || 'black',
      qr_code_url: searchCard.qr_code_url || p.qr_code_url,
      created_at: searchCard.created_at,
      profile_id: searchCard.profile_id,
      full_name: searchCard.full_name || p.full_name,
      company: searchCard.company || p.company,
      job_title: searchCard.job_title || p.job_title,
      bio: p.bio,
      phone: searchCard.phone || p.phone,
      email: searchCard.email || p.email,
      location: p.location,
      instagram: p.instagram,
      tiktok: p.tiktok,
      linkedin: p.linkedin,
      other_links: p.other_links,
      whatsapp: p.whatsapp,
      facebook: p.facebook,
      twitter: p.twitter,
      website: p.website || searchCard.website,
      logo_url: searchCard.logo_url || p.logo_url,
      profile_photo_url: searchCard.profile_photo_url || p.profile_photo_url,
      custom_links: p.custom_links,
      social_links: p.social_links,
      card_type: searchCard.card_type
    }

    return NextResponse.json(publicProfile)

  } catch (error) {
    console.error('Error fetching NFC public profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}
