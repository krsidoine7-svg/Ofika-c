// =====================================================
// SERVICE DE VÉRIFICATION & SYNCHRONISATION SUPABASE
// =====================================================
// Vérifie automatiquement que les données localStorage 
// sont bien sauvegardées dans Supabase

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const getSupabase = () => createClient()

// =====================================================
// 🔍 VÉRIFICATION AUTOMATIQUE DES DONNÉES
// =====================================================

/**
 * Vérifie si des données existent dans une table Supabase
 * @param table - Nom de la table ('profiles', 'nfc_profiles', etc.)
 * @param userId - ID de l'utilisateur
 * @returns Résultat de la vérification avec nombre d'enregistrements
 */
export async function verifySupabaseData(
  table: 'profiles' | 'digital_nfc_cards',
  userId?: string
): Promise<{
  success: boolean
  count: number
  data?: any[]
  error?: string
}> {
  try {
    console.log(`🔍 Vérification des données dans ${table}...`)

    // Si pas d'userId fourni, récupérer l'utilisateur connecté
    if (!userId) {
      const { data: { user } } = await getSupabase().auth.getUser()
      if (!user) {
        return {
          success: false,
          count: 0,
          error: 'Utilisateur non authentifié'
        }
      }
      userId = user.id
    }

    // Récupérer les données de l'utilisateur
    const { data, error, count } = await getSupabase()
      .from(table)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (error) {
      console.error(`❌ Erreur lors de la vérification de ${table}:`, error.message)
      return {
        success: false,
        count: 0,
        error: error.message
      }
    }

    const recordCount = count || 0

    if (recordCount > 0) {
      console.log(`✅ ${recordCount} enregistrement(s) trouvé(s) dans ${table}`)
      console.log('📦 Données:', data)
      return {
        success: true,
        count: recordCount,
        data: data || []
      }
    } else {
      console.warn(`⚠️ Aucune donnée trouvée dans ${table}`)
      return {
        success: true,
        count: 0,
        data: []
      }
    }
  } catch (error) {
    console.error(`❌ Exception lors de la vérification de ${table}:`, error)
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// =====================================================
// 💾 SYNCHRONISATION LOCALSTORAGE → SUPABASE
// =====================================================

/**
 * Synchronise les données du localStorage vers Supabase
 * Utile après un signup ou un rafraîchissement de page
 */
export async function syncLocalStorageToSupabase(): Promise<{
  success: boolean
  syncedTables: string[]
  error?: string
}> {
  try {
    console.log('🔄 Début de la synchronisation localStorage → Supabase')
    const syncedTables: string[] = []

    // Vérifier l'authentification
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) {
      console.warn('⚠️ Pas d\'utilisateur connecté - synchronisation annulée')
      return {
        success: false,
        syncedTables: [],
        error: 'Utilisateur non authentifié'
      }
    }

    // 1. Synchroniser les profils publics
    const pendingProfile = localStorage.getItem('pending_profile_creation')
    if (pendingProfile) {
      try {
        const profileData = JSON.parse(pendingProfile)
        console.log('📤 Synchronisation profil public:', profileData.name)

        // Vérifier si le profil n'existe pas déjà
        const { data: existingProfile } = await getSupabase()
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', profileData.name)
          .single()

        if (!existingProfile) {
          const { error } = await getSupabase()
            .from('profiles')
            .insert({
              user_id: user.id,
              name: profileData.name,
              profile_type: profileData.profile_type,
              bio: profileData.bio,
              email: profileData.email,
              phone: profileData.phone,
              social_links: profileData.social_links || [],
              custom_links: profileData.custom_links || [],
              is_public: profileData.is_public || true,
              is_active: true
            })

          if (error) throw error

          console.log('✅ Profil public synchronisé')
          syncedTables.push('profiles')
          localStorage.removeItem('pending_profile_creation')
        } else {
          console.log('ℹ️ Profil déjà existant, nettoyage localStorage')
          localStorage.removeItem('pending_profile_creation')
        }
      } catch (error) {
        console.error('❌ Erreur synchronisation profil:', error)
      }
    }

    // 2. Synchroniser les cartes NFC
    const pendingNFCCard = localStorage.getItem('pending_nfc_card_creation')
    if (pendingNFCCard) {
      try {
        const cardData = JSON.parse(pendingNFCCard)
        console.log('📤 Synchronisation carte NFC:', cardData.formData?.profileName)

        // Appeler le service de création de carte
        const { createNFCCard } = await import('./nfc-cards')
        const result = await createNFCCard({
          profile_name: cardData.formData.profileName,
          nfc_link: `${window.location.origin}/${cardData.formData.customUrl || 'card'}`,
          design_choice: cardData.selectedDesign?.id || 'design1',
          color_theme: cardData.selectedColor?.id || 'black',
          ...cardData.formData
        })

        if (result.success) {
          console.log('✅ Carte NFC synchronisée:', result.data?.id)
          syncedTables.push('digital_nfc_cards')
          localStorage.removeItem('pending_nfc_card_creation')
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('❌ Erreur synchronisation carte NFC:', error)
      }
    }

    return {
      success: true,
      syncedTables
    }
  } catch (error) {
    console.error('❌ Erreur générale de synchronisation:', error)
    return {
      success: false,
      syncedTables: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// =====================================================
// 🧪 TEST AUTOMATIQUE DE CONNEXION SUPABASE
// =====================================================

/**
 * Teste la connexion à Supabase et affiche les résultats
 * À utiliser en développement pour déboguer
 */
export async function testSupabaseConnection(): Promise<{
  isConnected: boolean
  userId?: string
  error?: string
}> {
  try {
    console.log('🧪 Test de connexion Supabase...')

    // Test 1 : Vérifier l'authentification
    const { data: { user }, error: authError } = await getSupabase().auth.getUser()

    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError.message)
      return {
        isConnected: false,
        error: authError.message
      }
    }

    if (!user) {
      console.warn('⚠️ Aucun utilisateur connecté')
      return {
        isConnected: true,
        error: 'Utilisateur non authentifié'
      }
    }

    console.log('✅ Utilisateur connecté:', user.email)

    // Test 2 : Vérifier l'accès à la base de données
    const { error: dbError } = await getSupabase()
      .from('profiles')
      .select('count')
      .limit(1)

    if (dbError) {
      console.error('❌ Erreur d\'accès à la base de données:', dbError.message)
      return {
        isConnected: false,
        userId: user.id,
        error: dbError.message
      }
    }

    console.log('✅ Connexion Supabase fonctionnelle')
    return {
      isConnected: true,
      userId: user.id
    }
  } catch (error) {
    console.error('❌ Exception lors du test:', error)
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// =====================================================
// 📊 AFFICHAGE UI DES RÉSULTATS DE VÉRIFICATION
// =====================================================

/**
 * Affiche un toast avec le résultat de la vérification
 * @param table - Table vérifiée
 * @param result - Résultat de verifySupabaseData
 */
export function displayVerificationResult(
  table: string,
  result: Awaited<ReturnType<typeof verifySupabaseData>>
) {
  if (result.success && result.count > 0) {
    toast.success(
      `✅ ${result.count} enregistrement(s) trouvé(s) dans ${table}`,
      {
        description: 'Vos données sont bien sauvegardées dans Supabase',
        duration: 4000
      }
    )
  } else if (result.success && result.count === 0) {
    toast.warning(
      `⚠️ Aucune donnée dans ${table}`,
      {
        description: 'Vos données n\'ont pas encore été sauvegardées',
        duration: 4000
      }
    )
  } else {
    toast.error(
      `❌ Erreur lors de la vérification de ${table}`,
      {
        description: result.error || 'Erreur inconnue',
        duration: 5000
      }
    )
  }
}

// =====================================================
// 🔄 NETTOYAGE DU LOCALSTORAGE
// =====================================================

/**
 * Nettoie toutes les clés de localStorage liées à l'onboarding
 */
export function cleanupOnboardingLocalStorage() {
  const keys = [
    'pending_profile_creation',
    'pendingProfileData',
    'pending_nfc_card_creation'
  ]

  keys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`🧹 Nettoyage localStorage: ${key}`)
    }
  })
}
