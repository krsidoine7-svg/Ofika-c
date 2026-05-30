require('dotenv').config({ path: '.env.local' })
const axios = require('axios')

async function testNFCWebhookComplete() {
  console.log('🧪 Test du webhook NFC avec toutes les informations...\n')

  const webhookUrl = process.env.MAKE_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('❌ URL du webhook Make.com manquante')
    return
  }

  // Données complètes simulées d'une carte NFC
  const completeNFCCardData = {
    // Informations de base de la carte
    carte_id: 'test-nfc-card-' + Date.now(),
    nom_profil: 'Jean Dupont NFC',
    lien_nfc: 'https://ofika.com/jean-dupont-nfc',
    lien_page_publique: 'https://ofika.com/jean-dupont-nfc',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ofika.com/jean-dupont-nfc',
    choix_design: 'ofika-optimized',
    theme_couleur: 'ofika',
    statut: 'pending',
    date_creation: new Date().toISOString(),
    
    // Informations personnelles
    nom_complet: 'Jean Dupont',
    entreprise: 'Acme Corporation',
    poste: 'CEO & Fondateur',
    biographie: 'Passionné de technologie et d\'innovation, je dirige Acme Corporation avec une vision claire de l\'avenir.',
    telephone: '+33 6 12 34 56 78',
    email: 'jean.dupont@acme.com',
    localisation: 'Paris, France',
    
    // Réseaux sociaux
    instagram: 'https://instagram.com/jean.dupont',
    tiktok: 'https://tiktok.com/@jean.dupont',
    linkedin: 'https://linkedin.com/in/jean-dupont',
    autres_liens: 'https://jean-dupont.com',
    
    // Configuration du profil
    nom_utilisateur: 'jean-dupont',
    url_personnalisee: 'https://ofika.com/jean-dupont-nfc',
    
    // Images
    logo_url: 'https://ofika.com/uploads/logos/acme-logo.png',
    photo_profil_url: 'https://ofika.com/uploads/profiles/jean-dupont.jpg',
    
    // Informations techniques
    profile_id: 'profile-' + Date.now(),
    user_id: 'user-' + Date.now(),
    user_email: 'jean.dupont@acme.com',
    
    // URLs importantes
    url_redirection: 'https://ofika.com/jean-dupont-nfc',
    url_administration: 'https://ofika.com/admin/nfc-cards/test-nfc-card-' + Date.now(),
    
    // Métadonnées
    type_carte: 'NFC_QR',
    version: '1.0',
    source: 'onboarding_nfc'
  }

  try {
    console.log('📤 Envoi du webhook avec toutes les informations...')
    console.log('📊 Nombre de champs:', Object.keys(completeNFCCardData).length)
    
    const response = await axios.post(webhookUrl, {
      event: 'NFC_CARD_CREATED',
      data: completeNFCCardData,
      timestamp: new Date().toISOString(),
      source: 'test-script'
    })

    console.log('✅ Webhook envoyé avec succès!')
    console.log('📈 Status:', response.status)
    console.log('📋 Réponse:', response.data)
    
    console.log('\n📝 Informations envoyées:')
    Object.entries(completeNFCCardData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du webhook:', error.message)
    if (error.response) {
      console.error('📊 Status:', error.response.status)
      console.error('📋 Réponse:', error.response.data)
    }
  }
}

testNFCWebhookComplete()
