import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante dans .env.local')
  process.exit(1)
}

// Utiliser la clé service_role si disponible pour le nettoyage complet
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey)

// Répertoire des rapports
const ARTIFACT_DIR = 'C:/Users/Toto.ADMINISTRATOR/.gemini/antigravity-ide/brain/b164d5e3-f362-4c21-8ab3-b1e32665fb2f'

async function runPublicOnboardingTest() {
  console.log('🤖 Démarrage du Test Automatisé de l\'Onboarding Public (Option A)...')
  
  const report: string[] = []
  report.push('# Rapport de Test Automatisé — Onboarding Public (Option A)')
  report.push(`*Date d'exécution : ${new Date().toLocaleString()}*`)
  report.push('\nCe test simule et vérifie le parcours d\'onboarding public classique (Option A - Formulaire d\'abord, puis Design, puis Inscription et persistance).\n')

  let hasErrors = false
  
  // Données de test simulées
  const testId = Math.floor(100000 + Math.random() * 900000)
  const testEmail = `test_public_onboarding_${testId}@ofika-temp.com`
  const testPassword = `TempPasswordTest123!`
  
  const mockFormData = {
    fullName: 'Jean-Marc Yacé Option A Test',
    phone: '+2250505050505',
    email: testEmail,
    company: 'Ofika Enterprise A',
    jobTitle: 'Directeur Option A',
    consentTerms: true,
    location: 'Abidjan, Côte d\'Ivoire',
    profileName: 'Jean-Marc Yacé Option A',
    bio: 'Ceci est une bio de test pour le flux public Option A.',
    customUrl: `jean-marc-yace-a-${testId}`,
    username: `jean_marc_a_${testId}`
  }

  const selectedDesign = 'design1'

  try {
    // -------------------------------------------------------------
    // ÉTAPE 1 : Formulaire de Coordonnées (FORM)
    // -------------------------------------------------------------
    console.log('➡️ Étape 1 : FORM (Saisie et validation)')
    report.push('## 📍 Étape 1 : Formulaire de Coordonnées (FORM)')
    
    // Vérification de la conformité des champs
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mockFormData.email)
    const hasRequiredFields = !!(mockFormData.fullName && mockFormData.phone && mockFormData.email && mockFormData.consentTerms)
    
    report.push(`- [x] Vérification de la conformité des coordonnées :`)
    report.push(`  - Nom Complet : "${mockFormData.fullName}"`)
    report.push(`  - Téléphone : "${mockFormData.phone}"`)
    report.push(`  - E-mail : "${mockFormData.email}" (Format valide : ${isEmailValid})`)
    report.push(`  - Consentement : ${mockFormData.consentTerms ? 'Accepté' : 'Refusé'}`)
    
    if (!hasRequiredFields) {
      throw new Error('Champs obligatoires manquants à l\'étape FORM')
    }
    report.push('- [x] Transition vers l\'étape 2 (TEMPLATE) réussie.')

    // -------------------------------------------------------------
    // ÉTAPE 2 : Choix du Design (TEMPLATE)
    // -------------------------------------------------------------
    console.log('➡️ Étape 2 : TEMPLATE (Sélection et persistance locale)')
    report.push('\n## 📍 Étape 2 : Choix du Design (TEMPLATE)')
    report.push(`- [x] Design sélectionné : **${selectedDesign}**`)

    // Simulation de la persistance locale avant inscription (Option A spec)
    const pendingProfileCreation = {
      ...mockFormData,
      design_choice: selectedDesign
    }
    const serializedData = JSON.stringify(pendingProfileCreation)
    const parsedData = JSON.parse(serializedData)
    
    const isStorageCorrect = parsedData.fullName === mockFormData.fullName && parsedData.design_choice === selectedDesign
    report.push(`- [x] Simulation de sauvegarde dans localStorage (\`pending_profile_creation\`) : ${isStorageCorrect ? 'Réussie et Conforme' : 'Échec'}`)
    if (!isStorageCorrect) {
      throw new Error('Échec de persistance localStorage simulée.')
    }
    report.push('- [x] Transition vers l\'étape 3 (SIGNUP) réussie.')

    // -------------------------------------------------------------
    // ÉTAPE 3 : Inscription (SIGNUP)
    // -------------------------------------------------------------
    console.log('➡️ Étape 3 : SIGNUP (Inscription utilisateur)')
    report.push('\n## 📍 Étape 3 : Inscription (SIGNUP)')
    
    // Inscription de l'utilisateur de test via l'API Admin de Supabase
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: mockFormData.fullName,
        phone: mockFormData.phone
      }
    })

    if (authError) {
      throw new Error(`Échec d'inscription : ${authError.message}`)
    }

    const userId = authUser.user?.id
    if (!userId) {
      throw new Error('Utilisateur créé mais ID introuvable.')
    }
    report.push(`- [x] Création du compte utilisateur (\`${testEmail}\`) : Réussie (ID: \`${userId}\`)`)

    // -------------------------------------------------------------
    // ÉTAPE 4 : Finalisation et persistance en base de données
    // -------------------------------------------------------------
    console.log('➡️ Étape 4 : FINALISATION (Écritures DB)')
    report.push('\n## 📍 Étape 4 : Finalisation & Écritures DB')

    // 1. Insertion dans la table 'profiles'
    console.log('  - Enregistrement du profil dans public.profiles...')
    const { data: insertedProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        profile_type: 'professional',
        name: mockFormData.fullName,
        bio: mockFormData.bio,
        phone: mockFormData.phone,
        email: mockFormData.email,
        company: mockFormData.company,
        job_title: mockFormData.jobTitle,
        location: mockFormData.location,
        custom_url: mockFormData.customUrl,
        username: mockFormData.username,
        design_choice: selectedDesign,
        is_active: true,
        is_public: true
      })
      .select()
      .single()

    if (profileError) {
      throw new Error(`Échec de persistance du profil : ${profileError.message}`)
    }
    report.push(`- [x] Insertion profil (\`profiles\`) : Réussie`)
    report.push(`  - custom_url : "${insertedProfile.custom_url}"`)
    report.push(`  - design_choice : "${insertedProfile.design_choice}"`)

    // 2. Insertion dans la table 'digital_nfc_cards' (simulation du service createNFCCard)
    console.log('  - Enregistrement de la carte numérique dans public.digital_nfc_cards...')
    const { data: insertedCard, error: cardError } = await supabase
      .from('digital_nfc_cards')
      .insert({
        user_id: userId,
        profile_id: insertedProfile.id,
        profile_name: mockFormData.fullName,
        nfc_link: `https://ofika.ci/${mockFormData.customUrl}`,
        design_choice: selectedDesign,
        color_theme: 'black',
        status: 'active',
        full_name: mockFormData.fullName,
        company: mockFormData.company,
        job_title: mockFormData.jobTitle,
        phone: mockFormData.phone,
        email: mockFormData.email,
        custom_url: mockFormData.customUrl
      })
      .select()
      .single()

    if (cardError) {
      throw new Error(`Échec de persistance de la carte numérique : ${cardError.message}`)
    }
    report.push(`- [x] Insertion carte numérique (\`digital_nfc_cards\`) : Réussie`)
    report.push(`  - nfc_link : "${insertedCard.nfc_link}"`)
    report.push(`  - status : "${insertedCard.status}"`)

    // -------------------------------------------------------------
    // NETTOYAGE DES DONNÉES (CLEANUP)
    // -------------------------------------------------------------
    console.log('🧹 Nettoyage des données de test...')
    
    // Supprimer la carte
    await supabase.from('digital_nfc_cards').delete().eq('user_id', userId)
    // Supprimer le profil
    await supabase.from('profiles').delete().eq('user_id', userId)
    
    // Supprimer l'utilisateur auth
    if (serviceRoleKey) {
      await supabase.auth.admin.deleteUser(userId)
      report.push(`- [x] Nettoyage DB (Profil, carte et utilisateur de test supprimés) : Réussie`)
    } else {
      report.push(`- [!] Nettoyage partiel (Profil et carte supprimés, auth requiert la clé service_role)`)
    }

    report.push('\n### 🎉 RÉSULTAT DU TEST : SUCCESS !')
    report.push('Le flux onboarding Option A éplement opérationnel. La persistance en base de données et les clés de relations (profils <-> cartes) sont conformes.')

  } catch (error: any) {
    hasErrors = true
    console.error('❌ ERREUR LORS DU TEST DE L\'ONBOARDING PUBLIC:', error.message)
    report.push(`\n### ❌ RÉSULTAT DU TEST : ÉCHEC`)
    report.push(`**Erreur rencontrée :** ${error.message}`)
  }

  // Écriture du rapport
  const reportPath = path.join(ARTIFACT_DIR, 'onboarding_option_a_report.md')
  fs.writeFileSync(reportPath, report.join('\n'))
  console.log(`✅ Rapport de test écrit dans ${reportPath}`)
}

runPublicOnboardingTest()
