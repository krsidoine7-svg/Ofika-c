// =====================================================
// SERVICES POUR LES CARTES NFC
// =====================================================

import { createClient } from '@/lib/supabase/client'
import { NFCCard, CreateNFCCardData, UpdateNFCCardData, NFCCardResponse, NFCCardsResponse } from '@/lib/types/nfc-cards'
import { WebhookService } from './business-rules'
import { generateQRCode } from './qr-code'

const getSupabase = () => createClient()

// Récupérer toutes les cartes NFC d'un utilisateur
export async function getNFCCards(userId?: string): Promise<NFCCardsResponse> {
  try {
    const { data: { user: authUser } } = await getSupabase().auth.getUser()
    
    // Détection de l'impersonation pour l'admin
    let impersonatedId = null
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/x-impersonating-user=([^;]+)/)
      impersonatedId = match ? match[1] : null
    }

    const targetUserId = userId || impersonatedId || authUser?.id

    if (!targetUserId) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const { data, error } = await getSupabase()
      .from('digital_nfc_cards')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching NFC cards:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getNFCCards:', error)
    return { success: false, error: 'Erreur lors de la récupération des cartes NFC' }
  }
}

// Récupérer une carte NFC spécifique
export async function getNFCCard(cardId: string): Promise<NFCCardResponse> {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const { data, error } = await getSupabase()
      .from('digital_nfc_cards')
      .select('*')
      .eq('id', cardId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching NFC card:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getNFCCard:', error)
    return { success: false, error: 'Erreur lors de la récupération de la carte NFC' }
  }
}

// Créer une nouvelle carte NFC
export async function createNFCCard(cardData: CreateNFCCardData): Promise<NFCCardResponse> {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // 1. Upload du logo vers Supabase Storage si un fichier est fourni
    let logoUrl = ''
    if ((cardData as any).logoFile) {
      console.log('📤 Upload du logo vers Supabase Storage...')
      const { uploadNFCAsset } = await import('./storage')
      const uploadResult = await uploadNFCAsset(
        (cardData as any).logoFile,
        user.id,
        'logo'
      )
      
      if (uploadResult.success && uploadResult.url) {
        logoUrl = uploadResult.url
        console.log('✅ Logo uploadé:', logoUrl)
      } else {
        console.warn('⚠️ Échec de l\'upload du logo:', uploadResult.error)
      }
    } else if ((cardData as any).logoUrl) {
      logoUrl = (cardData as any).logoUrl
    }

    // 2. Upload de la photo de profil si fournie
    let profilePhotoUrl = ''
    if ((cardData as any).profilePhotoFile) {
      console.log('📤 Upload de la photo de profil vers Supabase Storage...')
      const { uploadNFCAsset } = await import('./storage')
      const uploadResult = await uploadNFCAsset(
        (cardData as any).profilePhotoFile,
        user.id,
        'photo'
      )
      
      if (uploadResult.success && uploadResult.url) {
        profilePhotoUrl = uploadResult.url
        console.log('✅ Photo de profil uploadée:', profilePhotoUrl)
      } else {
        console.warn('⚠️ Échec de l\'upload de la photo:', uploadResult.error)
      }
    } else if ((cardData as any).profilePhotoUrl) {
      profilePhotoUrl = (cardData as any).profilePhotoUrl
    }

    // 3. Création automatique de profil si profile_id absent
    let profileId = cardData.profile_id
    if (!profileId) {
      console.log('🔄 Création automatique de profil pour la carte NFC...')
      const profileResult = await createProfileForNFCCard(user.id, cardData, logoUrl, profilePhotoUrl)
      if (profileResult.success && profileResult.data) {
        profileId = profileResult.data.id
        console.log('✅ Profil créé automatiquement:', profileId)
        
        // Mettre à jour le lien NFC avec l'URL du profil si nécessaire
        const prof = profileResult.data
        const slug = prof.custom_url || prof.username
        if (slug) {
          const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
          const appUrl = rawAppUrl.replace(/\/$/, '')
          cardData.nfc_link = `${appUrl}/${slug}`
          console.log('🔗 Nouveau lien NFC synchronisé avec le profil:', cardData.nfc_link)
        }
      } else {
        console.warn('⚠️ Impossible de créer le profil automatiquement:', profileResult.error)
      }
    }

    // Préparer les données d'insertion UNIQUEMENT avec les colonnes existantes dans digital_nfc_cards
    const insertData: any = {
      user_id: user.id,
      profile_name: cardData.profile_name.substring(0, 255),
      nfc_link: cardData.nfc_link,
      design_choice: cardData.design_choice.substring(0, 100),
      color_theme: cardData.color_theme.substring(0, 50),
      status: 'active',
      
      // Informations personnelles (colonnes existantes)
      full_name: (cardData as any).fullName || cardData.profile_name,
      company: (cardData as any).company || '',
      job_title: (cardData as any).jobTitle || '',
      phone: (cardData as any).phone || '',
      email: (cardData as any).email || '',
      
      // Profil (colonnes existantes) - username et website SUPPRIMÉS
      custom_url: (cardData as any).customUrl || '',
      
      // Images (colonnes existantes) - URLs depuis Supabase Storage
      logo_url: logoUrl,
      profile_photo_url: profilePhotoUrl
    }
    
    // Note : bio, instagram, tiktok, linkedin, other_links, location, website, username ne sont PAS dans digital_nfc_cards
    // Ces infos seront stockées dans le profil associé via createProfileForNFCCard

    // Ajouter profile_id s'il existe
    if (profileId) {
      insertData.profile_id = profileId
    }

    const { data, error } = await getSupabase()
      .from('digital_nfc_cards')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating NFC card:', error)
      return { success: false, error: error.message }
    }

    // Générer automatiquement le QR code
    if (data) {
      const qrResult = await generateQRCode(cardData.nfc_link)
      if (qrResult.success && qrResult.data) {
        const qrUrl = qrResult.data.qr_code_url;
        
        // Mettre à jour digital_nfc_cards avec le QR code
        await getSupabase()
          .from('digital_nfc_cards')
          .update({
            qr_code_url: qrUrl,
            qr_redirect_id: qrResult.data.redirect_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
        
        // Mettre à jour les données retournées
        data.qr_code_url = qrUrl
        console.log('✅ QR code généré pour la carte:', qrUrl)
      } else {
        console.warn('⚠️ Impossible de générer le QR code:', qrResult.error)
      }
    }

    // 🎯 WEBHOOK COMPLET - CARTE NFC CRÉÉE
    if (data) {
      // Envoyer le webhook en arrière-plan sans bloquer la réponse UI pour une création ultra rapide
      (async () => {
        try {
          let profileDetails = null
          if (profileId) {
            const { data: profile } = await getSupabase()
              .from('profiles')
              .select('*')
              .eq('id', profileId)
              .single()
            if (profile) profileDetails = profile
          }

          await WebhookService.sendSimpleWebhook(
            'NFC_CARD_CREATED',
            {
              carte_id: data.id,
              nom_profil: data.profile_name,
              lien_nfc: data.nfc_link,
              lien_page_publique: data.nfc_link,
              qr_code_url: data.qr_code_url,
              choix_design: data.design_choice,
              theme_couleur: data.color_theme,
              statut: data.status,
              date_creation: data.created_at,
              nom_complet: data.full_name,
              entreprise: data.company,
              poste: data.job_title,
              telephone: data.phone,
              email: data.email,
              logo_url: data.logo_url || '',
              url_personnalisee: data.custom_url || '',
              profile_id: profileId || null,
              user_id: user.id,
              user_email: user.email,
              type_carte: 'NFC_QR',
              version: '2.0',
              source: 'onboarding_nfc',
              profil_associe: profileId ? {
                id: profileDetails?.id,
                nom: profileDetails?.full_name || undefined,
                bio: profileDetails?.bio || undefined,
                localisation: profileDetails?.location || undefined,
                reseaux_sociaux: {
                  instagram: profileDetails?.instagram || undefined,
                  tiktok: profileDetails?.tiktok || undefined,
                  linkedin: profileDetails?.linkedin || undefined,
                  autres: profileDetails?.other_links || undefined
                }
              } : null
            },
            user.id,
            user.email
          )
          console.log('✅ Webhook carte NFC créée envoyé en arrière-plan')
        } catch (wbErr) {
          console.warn('⚠️ Erreur webhook carte NFC (arrière-plan):', wbErr)
        }
      })()
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createNFCCard:', error)
    return { success: false, error: 'Erreur lors de la création de la carte NFC' }
  }
}

// Créer automatiquement un profil pour une carte NFC
async function createProfileForNFCCard(userId: string, cardData: CreateNFCCardData, logoUrl?: string, profilePhotoUrl?: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Extraire les données du formulaire NFC si disponibles
    const nfcFormData = cardData as any // Cast pour accéder aux propriétés du formulaire
    
    // Generate unique username if not provided or empty
    let username = nfcFormData.username || nfcFormData.customUrl
    if (!username || username.trim() === '') {
      // Generate a unique username based on full name and timestamp
      const baseName = (nfcFormData.fullName || cardData.profile_name || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20)
      const timestamp = Date.now().toString().slice(-6)
      username = `${baseName}${timestamp}`
    }
    
    const { data, error } = await getSupabase()
      .from('profiles')
      .insert({
        user_id: userId,
        profile_type: 'professional',
        full_name: nfcFormData.fullName || cardData.profile_name,
        company: nfcFormData.company || '',
        job_title: nfcFormData.jobTitle || '',
        bio: nfcFormData.bio || '',
        phone: nfcFormData.phone || '',
        email: nfcFormData.email || '',
        location: nfcFormData.location || '',
        
        // Anciens réseaux sociaux (fallback)
        instagram: nfcFormData.instagram || '',
        tiktok: nfcFormData.tiktok || '',
        linkedin: nfcFormData.linkedin || '',
        other_links: nfcFormData.otherLinks || '',
        
        // Nouveaux réseaux sociaux unifiés
        social_links: nfcFormData.social_links || [],
        custom_links: nfcFormData.custom_links || [],
        
        username: username,
        custom_url: nfcFormData.customUrl || username,
        logo_url: logoUrl || nfcFormData.logoUrl || null,
        profile_photo_url: profilePhotoUrl || nfcFormData.profilePhotoUrl || null,
        status: 'active',
        design_choice: cardData.design_choice || 'design1'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile for NFC card:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createProfileForNFCCard:', error)
    return { success: false, error: 'Erreur lors de la création du profil' }
  }
}

// Mettre à jour une carte NFC
export async function updateNFCCard(cardId: string, updateData: UpdateNFCCardData): Promise<NFCCardResponse> {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const { data, error } = await getSupabase()
      .from('digital_nfc_cards')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating NFC card:', error)
      return { success: false, error: error.message }
    }

    // 2. Synchroniser le lien avec la redirection QR associée si nécessaire
    if (updateData.nfc_link && data.qr_redirect_id) {
        console.log('🔄 Synchronisation du lien avec la redirection QR:', data.qr_redirect_id)
        await getSupabase()
            .from('qr_redirects')
            .update({ 
                nfc_link: updateData.nfc_link,
                updated_at: new Date().toISOString()
            })
            .eq('id', data.qr_redirect_id)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in updateNFCCard:', error)
    return { success: false, error: 'Erreur lors de la mise à jour de la carte NFC' }
  }
}

// Supprimer une carte NFC (soft delete)
export async function deleteNFCCard(cardId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const { error } = await getSupabase()
      .from('digital_nfc_cards')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting NFC card:', error)
      return { success: false, error: error.message }
    }

    // 2. Désactiver aussi la redirection QR associée si elle existe
    // On récupère d'abord la carte pour avoir le qr_redirect_id
    const { data: card } = await getSupabase()
        .from('digital_nfc_cards')
        .select('qr_redirect_id')
        .eq('id', cardId)
        .single()
    
    if (card?.qr_redirect_id) {
        console.log('🚫 Désactivation de la redirection QR associée:', card.qr_redirect_id)
        await getSupabase()
            .from('qr_redirects')
            .update({ 
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', card.qr_redirect_id)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteNFCCard:', error)
    return { success: false, error: 'Erreur lors de la suppression de la carte NFC' }
  }
}

// Obtenir les statistiques des cartes NFC
export async function getNFCCardStats(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const { data, error } = await getSupabase()
      .from('digital_nfc_cards')
      .select('status')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching NFC card stats:', error)
      return { success: false, error: error.message }
    }

    const stats = {
      total_cards: data.length,
      active_cards: data.filter(card => card.status === 'active').length,
      pending_cards: data.filter(card => card.status === 'pending').length,
      shipped_cards: data.filter(card => card.status === 'shipped').length,
      delivered_cards: data.filter(card => card.status === 'delivered').length
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error in getNFCCardStats:', error)
    return { success: false, error: 'Erreur lors de la récupération des statistiques' }
  }
}
