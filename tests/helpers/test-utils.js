// =====================================================
// UTILITAIRES DE TEST
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables d\'environnement Supabase manquantes')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

/**
 * Attendre un délai spécifié
 * @param {number} ms - Millisecondes à attendre
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Générer un ID de test unique
 * @param {string} prefix - Préfixe pour l'ID
 * @returns {string} ID unique
 */
function generateTestId(prefix = 'test') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Nettoyer les données de test
 * @param {string} table - Nom de la table
 * @param {string} prefix - Préfixe des données à supprimer
 */
async function cleanupTestData(table, prefix = 'test') {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .like('id', `${prefix}_%`)

    if (error) {
      console.warn(`⚠️  Erreur lors du nettoyage de ${table}:`, error.message)
    } else {
      console.log(`✅ Données de test nettoyées dans ${table}`)
    }
  } catch (err) {
    console.warn(`⚠️  Erreur lors du nettoyage de ${table}:`, err.message)
  }
}

/**
 * Créer un profil de test
 * @param {object} overrides - Valeurs à surcharger
 * @returns {object} Profil créé
 */
async function createTestProfile(overrides = {}) {
  const testProfile = {
    id: generateTestId('profile'),
    profile_name: `Test Profile ${Date.now()}`,
    full_name: 'Test User',
    email: `test${Date.now()}@example.com`,
    phone: '+225 123456789',
    company: 'Test Company',
    job_title: 'Test Job',
    bio: 'Test bio for testing purposes',
    website: 'https://test.example.com',
    linkedin: 'https://linkedin.com/in/test',
    instagram: 'https://instagram.com/test',
    location: 'Test City',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(testProfile)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création profil: ${error.message}`)
  }

  return data
}

/**
 * Créer une commande de test
 * @param {object} overrides - Valeurs à surcharger
 * @returns {object} Commande créée
 */
async function createTestOrder(overrides = {}) {
  const testOrder = {
    id: generateTestId('order'),
    user_id: '00000000-0000-0000-0000-000000000000', // UUID de test
    card_type: 'nfc_qr',
    quantity: 1,
    unit_price: 15000,
    total_price: 15000,
    currency: 'XOF',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(testOrder)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création commande: ${error.message}`)
  }

  return data
}

/**
 * Créer des analytics de contact de test
 * @param {object} overrides - Valeurs à surcharger
 * @returns {object} Analytics créés
 */
async function createTestContactAnalytics(overrides = {}) {
  const testAnalytics = {
    id: generateTestId('analytics'),
    profile_id: generateTestId('profile'),
    user_agent: 'Mozilla/5.0 (Test Browser)',
    device_type: 'desktop',
    action_type: 'vcard_generated',
    created_at: new Date().toISOString(),
    ...overrides
  }

  const { data, error } = await supabase
    .from('contact_analytics')
    .insert(testAnalytics)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création analytics: ${error.message}`)
  }

  return data
}

/**
 * Mesurer le temps d'exécution d'une fonction
 * @param {Function} fn - Fonction à mesurer
 * @param {string} name - Nom de la fonction
 * @returns {any} Résultat de la fonction
 */
async function measureExecutionTime(fn, name = 'Function') {
  const startTime = Date.now()
  const result = await fn()
  const endTime = Date.now()
  const duration = endTime - startTime

  console.log(`⏱️  ${name}: ${duration}ms`)
  
  if (duration > 1000) {
    console.warn(`⚠️  ${name} est lent (>1s)`)
  }

  return result
}

/**
 * Vérifier qu'une table existe
 * @param {string} tableName - Nom de la table
 * @returns {boolean} True si la table existe
 */
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single()

    return !error && data
  } catch (err) {
    return false
  }
}

/**
 * Obtenir les statistiques d'une table
 * @param {string} tableName - Nom de la table
 * @returns {object} Statistiques de la table
 */
async function getTableStats(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(error.message)
    }

    return {
      table: tableName,
      count: count || 0,
      exists: true
    }
  } catch (err) {
    return {
      table: tableName,
      count: 0,
      exists: false,
      error: err.message
    }
  }
}

/**
 * Exécuter un test avec gestion d'erreur
 * @param {Function} testFn - Fonction de test
 * @param {string} testName - Nom du test
 * @returns {object} Résultat du test
 */
async function runTest(testFn, testName) {
  const startTime = Date.now()
  
  try {
    console.log(`🧪 Test: ${testName}`)
    const result = await testFn()
    const duration = Date.now() - startTime
    
    console.log(`✅ ${testName}: Réussi (${duration}ms)`)
    return { success: true, result, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    console.log(`❌ ${testName}: Échoué (${duration}ms)`)
    console.log(`   Erreur: ${error.message}`)
    return { success: false, error: error.message, duration }
  }
}

/**
 * Exécuter plusieurs tests en parallèle
 * @param {Array} tests - Liste des tests à exécuter
 * @returns {Array} Résultats des tests
 */
async function runTests(tests) {
  console.log(`🚀 Exécution de ${tests.length} tests...\n`)
  
  const results = await Promise.all(
    tests.map(({ fn, name }) => runTest(fn, name))
  )

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  console.log(`\n📊 Résultats:`)
  console.log(`   ✅ Réussis: ${successCount}`)
  console.log(`   ❌ Échoués: ${failureCount}`)
  console.log(`   📈 Taux de réussite: ${Math.round((successCount / tests.length) * 100)}%`)

  return results
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Utilitaires de base
  sleep,
  generateTestId,
  cleanupTestData,
  measureExecutionTime,
  
  // Création de données de test
  createTestProfile,
  createTestOrder,
  createTestContactAnalytics,
  
  // Vérifications
  tableExists,
  getTableStats,
  
  // Exécution de tests
  runTest,
  runTests,
  
  // Client Supabase
  supabase
}
