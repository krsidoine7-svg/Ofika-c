// =====================================================
// FIX : Génération Automatique des URLs de Profil
// =====================================================
// Ce fichier contient les fonctions corrigées pour éviter
// les URLs incorrectes dans les QR codes
// =====================================================

import { createClient } from '@/lib/supabase/client'

/**
 * Génère l'URL correcte du profil pour une carte NFC
 * Priorité :
 * 1. custom_url du profil
 * 2. username du profil
 * 3. Fallback vers dashboard
 */
export async function generateProfileURL(userId: string, profileId?: string): Promise<string> {
  const supabase = createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  
  try {
    // Si profileId est fourni, chercher ce profil spécifique
    if (profileId) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, custom_url')
        .eq('id', profileId)
        .single()
      
      if (!error && profile) {
        const slug = profile.custom_url || profile.username
        if (slug) {
          const url = `${baseUrl}/${slug}`
          console.log('✅ URL générée depuis profileId:', url)
          return url
        }
      }
    }
    
    // Sinon, chercher le profil principal de l'utilisateur
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('username, custom_url')
      .eq('user_id', userId)
      .single()
    
    if (!userError && userProfile) {
      const slug = userProfile.custom_url || userProfile.username
      if (slug) {
        const url = `${baseUrl}/${slug}`
        console.log('✅ URL générée depuis userId:', url)
        return url
      }
    }
    
    // Fallback : dashboard
    console.warn('⚠️ Aucun profil trouvé, utilisation du fallback dashboard')
    return `${baseUrl}/dashboard`
  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'URL:', error)
    return `${baseUrl}/dashboard`
  }
}

/**
 * Valide qu'une URL est correcte et non obsolète
 */
export function validateNFCUrl(url: string): { valid: boolean; error?: string; suggestion?: string } {
  try {
    const urlObj = new URL(url)
    
    // ❌ BLOQUER les URLs Vercel avec des IDs aléatoires
    if (urlObj.hostname.includes('vercel.app') && urlObj.pathname.length > 20) {
      return {
        valid: false,
        error: '⚠️ URL Vercel avec ID aléatoire détectée. Utilisez votre domaine ou localhost.',
        suggestion: 'Utilisez generateProfileURL() pour générer une URL correcte'
      }
    }
    
    // ❌ BLOQUER les URLs avec des IDs longs suspects
    if (urlObj.pathname.includes('jghTtdTNaworId')) {
      return {
        valid: false,
        error: '❌ URL incorrecte détectée',
        suggestion: 'Cette URL ne correspond pas à un profil valide'
      }
    }
    
    // ✅ Valider que c'est une URL HTTP/HTTPS
    if (!urlObj.protocol.startsWith('http')) {
      return { 
        valid: false, 
        error: 'L\'URL doit commencer par http:// ou https://' 
      }
    }
    
    // ✅ URL valide
    return { valid: true }
  } catch {
    return { 
      valid: false, 
      error: 'URL invalide ou malformée' 
    }
  }
}

/**
 * Corrige automatiquement une URL si elle est incorrecte
 */
export async function fixNFCUrlIfNeeded(
  currentUrl: string, 
  userId: string, 
  profileId?: string
): Promise<{ fixed: boolean; url: string; reason?: string }> {
  const validation = validateNFCUrl(currentUrl)
  
  if (!validation.valid) {
    // URL invalide, générer une nouvelle
    const newUrl = await generateProfileURL(userId, profileId)
    return {
      fixed: true,
      url: newUrl,
      reason: validation.error
    }
  }
  
  // URL valide, pas de changement
  return {
    fixed: false,
    url: currentUrl
  }
}

/**
 * Exemple d'utilisation dans createNFCCard
 */
/*
export async function createNFCCard(cardData: CreateNFCCardData): Promise<NFCCardResponse> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  let profileId = cardData.profile_id
  
  // ... création du profil si nécessaire ...

  // ✅ GÉNÉRATION AUTOMATIQUE DE L'URL CORRECTE
  let nfcLink = cardData.nfc_link
  
  if (!nfcLink || nfcLink.trim() === '') {
    // Pas d'URL fournie, générer automatiquement
    nfcLink = await generateProfileURL(user.id, profileId)
    console.log('✅ URL générée automatiquement:', nfcLink)
  } else {
    // URL fournie, valider et corriger si nécessaire
    const fixResult = await fixNFCUrlIfNeeded(nfcLink, user.id, profileId)
    if (fixResult.fixed) {
      console.warn('⚠️ URL corrigée:', fixResult.reason)
      console.log('Ancienne:', nfcLink)
      console.log('Nouvelle:', fixResult.url)
      nfcLink = fixResult.url
    }
  }

  const insertData = {
    user_id: user.id,
    profile_name: cardData.profile_name,
    nfc_link: nfcLink,  // ✅ URL validée et corrigée
    ...
  }

  // ... reste de la logique ...
}
*/
