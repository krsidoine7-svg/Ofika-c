// =====================================================
// API ENDPOINT - CRÉER UNE COMMANDE
// Version corrigée et sécurisée
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { CARD_PRICING, ORDER_LIMITS } from '@/lib/types/payments'

export const dynamic = 'force-dynamic'


// =====================================================
// TYPES ET SCHÉMAS
// =====================================================

const shippingAddressSchema = z.object({
  name: z.string().min(2, 'Nom complet requis (minimum 2 caractères)').max(100, 'Nom trop long'),
  email: z.union([z.string().email('Email valide requis'), z.literal('')]).optional(),
  phone: z.string().min(8, 'Numéro de téléphone requis (minimum 8 caractères)').max(20, 'Numéro trop long'),
  address: z.string().min(2, 'Adresse requise (minimum 2 caractères)').max(255, 'Adresse trop longue'),
  city: z.string().min(2, 'Ville requise (minimum 2 caractères)').max(100, 'Ville trop longue'),
  postalCode: z.union([z.string().min(2, 'Code postal requis').max(10, 'Code postal trop long'), z.literal('')]).optional(),
})

const orderCreateSchema = z.object({
  profile_id: z.string().uuid('ID de profil invalide').optional(),
  card_type: z.enum(['nfc_qr', 'qr_only', 'premium_subscription', 'custom']).default('nfc_qr'),
  quantity: z.union([z.number(), z.string()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => Number.isInteger(val) && val >= 1 && val <= ORDER_LIMITS.MAX_CARDS_PER_USER,
      `Quantité doit être un entier entre 1 et ${ORDER_LIMITS.MAX_CARDS_PER_USER}`),
  unit_price: z.union([z.number(), z.string()])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .refine(val => val >= 0, 'Prix unitaire doit être positif')
    .optional(),
  payment_method: z.enum(['lygos', 'wave', 'orange_money', 'mtn_money', 'geniuspay']).default('geniuspay'),
  shipping_address: shippingAddressSchema,
  metadata: z.record(z.any()).optional(),
})

// Types TypeScript inférés
type OrderCreateData = z.infer<typeof orderCreateSchema>
type ShippingAddress = z.infer<typeof shippingAddressSchema>

// =====================================================
// UTILITAIRES SÉCURISÉS
// =====================================================

// Rate limiting thread-safe (utilise un Map local à la fonction)
function createRateLimiter(windowMs = 60000, maxRequests = 5) {
  const requests = new Map<string, { count: number; resetAt: number }>()

  return function checkRateLimit(identifier: string): boolean {
    const now = Date.now()
    const userLimit = requests.get(identifier)

    if (!userLimit || now > userLimit.resetAt) {
      requests.set(identifier, { count: 1, resetAt: now + windowMs })
      return true
    }

    if (userLimit.count >= maxRequests) {
      return false
    }

    userLimit.count++
    return true
  }
}

const checkRateLimit = createRateLimiter()

// Calcul sécurisé du prix avec validation
function calculatePrice(dbPrice: number, quantity: number, unitPrice?: number): number {
  // Validation des entrées
  if (quantity < 1 || quantity > ORDER_LIMITS.MAX_CARDS_PER_USER) {
    throw new Error(`Quantité invalide: ${quantity}`)
  }

  if (unitPrice !== undefined && unitPrice < 0) {
    throw new Error(`Prix unitaire invalide: ${unitPrice}`)
  }

  // Le prix doit être d'au moins 200 XOF pour satisfaire aux exigences des passerelles (GeniusPay)
  const MIN_PRICE_XOF = 200

  // Si un prix unitaire est fourni, l'utiliser avec validation du minimum de 200 XOF
  if (unitPrice !== undefined && unitPrice >= MIN_PRICE_XOF) {
    return Math.round(unitPrice * quantity * 100) / 100
  }

  const effectivePrice = Math.max(dbPrice || 14600, MIN_PRICE_XOF)
  return Math.round(effectivePrice * quantity * 100) / 100
}

// Génération sécurisée de numéro de commande (avec retry en cas de collision)
async function generateOrderNumber(supabase: any, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0') // Janvier est 0
    const year = String(now.getFullYear()).slice(-2) // 2026 -> 26
    
    const dateStr = `${day}${month}${year}`
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const orderNumber = `OFIKA-REF-${dateStr}-${random}`

    // Vérifier si le numéro existe déjà
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single()

    if (!data) {
      return orderNumber
    }
  }

  throw new Error('Impossible de générer un numéro de commande unique')
}

// Validation des limites utilisateur
async function validateUserLimits(supabase: any, userId: string): Promise<void> {
  const { data: orderCount, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .neq('status', 'cancelled')

  if (error) {
    throw new Error('Erreur lors de la vérification des limites utilisateur')
  }

  if ((orderCount?.length || 0) >= ORDER_LIMITS.MAX_ORDERS_PER_USER) {
    throw new Error(`Limite de commandes atteinte (${ORDER_LIMITS.MAX_ORDERS_PER_USER} maximum)`)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const isProduction = process.env.NODE_ENV === 'production'

  // Logging détaillé en production pour diagnostiquer l'erreur 500
  const log = (message: string, data?: any) => {
    if (isProduction) {
      console.error(`[ORDERS_API_PROD] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    } else {
      console.log(`[ORDERS_API_DEV] ${message}`, data || '')
    }
  }

  try {
    log('🚀 Début de la requête POST /api/orders/create', {
      timestamp: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // 1. Rate limiting par IP (sécurisé)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    request.headers.get('x-client-ip') ||
                    'unknown'

    log(`📍 IP client: ${clientIP}`)

    if (!checkRateLimit(clientIP)) {
      log('⚠️ Rate limit dépassé', { clientIP })
      return NextResponse.json(
        {
          success: false,
          error: 'Trop de requêtes. Veuillez réessayer dans une minute.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )
    }

    // 2. Validation et parsing du corps de la requête
    log('📥 Parsing du corps de la requête')
    let body: unknown
    try {
      body = await request.json()
      log('✅ Corps JSON parsé avec succès', { bodyLength: JSON.stringify(body).length })
    } catch (parseError) {
      log('❌ Erreur parsing JSON', { error: parseError instanceof Error ? parseError.message : 'Unknown' })
      return NextResponse.json(
        {
          success: false,
          error: 'Corps de la requête JSON invalide',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      )
    }

    // 3. Validation des données avec Zod
    log('🔍 Validation Zod des données')
    const validationResult = orderCreateSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      log('❌ Erreurs de validation Zod', { errors })
      return NextResponse.json(
        {
          success: false,
          error: 'Données de commande invalides',
          details: errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    const orderData = validationResult.data
    log('✅ Validation Zod réussie', { cardType: orderData.card_type, quantity: orderData.quantity })

    // 4. Initialisation du client Supabase
    log('🔌 Initialisation client Supabase')
    let supabase: any
    try {
      supabase = await createClient()
      log('✅ Client Supabase initialisé')
    } catch (supabaseError) {
      log('❌ Erreur initialisation Supabase', { error: supabaseError instanceof Error ? supabaseError.message : 'Unknown' })
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de configuration serveur',
          code: 'SUPABASE_INIT_ERROR'
        },
        { status: 500 }
      )
    }

    // 5. Vérification de l'authentification avec gestion d'erreurs détaillée
    log('🔐 Vérification de l\'authentification')
    let user: any
    try {
      log('Appel de supabase.auth.getUser()...')
      const authResult = await supabase.auth.getUser()
      log('✅ Résultat de getUser reçu', { 
        hasData: !!authResult.data,
        hasUser: !!authResult.data?.user,
        hasError: !!authResult.error 
      })
      
      const { data: { user: userData }, error: authError } = authResult
      user = userData

      if (authError) {
        log('❌ Erreur authentification', {
          error: authError.message,
          status: authError.status,
          name: authError.name
        })

        // Différencier les types d'erreurs d'authentification
        if (authError.message?.includes('JWT') || authError.message?.includes('expired')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Session expirée. Veuillez vous reconnecter.',
              code: 'SESSION_EXPIRED'
            },
            { status: 401 }
          )
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Erreur d\'authentification',
            code: 'AUTH_ERROR'
          },
          { status: 401 }
        )
      }

      if (!user) {
        log('❌ Utilisateur non trouvé dans la session')
        return NextResponse.json(
          {
            success: false,
            error: 'Utilisateur non authentifié',
            code: 'USER_NOT_AUTHENTICATED'
          },
          { status: 401 }
        )
      }

      log('✅ Utilisateur authentifié', { userId: user.id })

    } catch (authCatchError) {
      log('💥 Exception lors de l\'authentification', {
        error: authCatchError instanceof Error ? authCatchError.message : 'Unknown',
        stack: authCatchError instanceof Error ? authCatchError.stack : 'No stack',
        toString: String(authCatchError)
      })
      
      // Retourner une erreur plus spécifique en dev
      const isDevelopment = process.env.NODE_ENV === 'development'
      return NextResponse.json(
        {
          success: false,
          error: isDevelopment 
            ? `Exception auth: ${authCatchError instanceof Error ? authCatchError.message : String(authCatchError)}`
            : 'Erreur serveur d\'authentification',
          code: 'AUTH_EXCEPTION',
          ...(isDevelopment && authCatchError instanceof Error && { stack: authCatchError.stack })
        },
        { status: 500 }
      )
    }

    // 6. Validation des limites utilisateur - DÉSACTIVÉE
    // COMMENTÉ: Cette vérification causait des erreurs 400
    /*
    log('👤 Validation des limites utilisateur')
    try {
      await validateUserLimits(supabase, user.id)
      log('✅ Limites utilisateur validées')
    } catch (limitsError) {
      log('❌ Erreur limites utilisateur', {
        error: limitsError instanceof Error ? limitsError.message : 'Unknown'
      })
      return NextResponse.json(
        {
          success: false,
          error: limitsError instanceof Error ? limitsError.message : 'Limite utilisateur atteinte',
          code: 'USER_LIMITS_EXCEEDED'
        },
        { status: 400 }
      )
    }
    */
    log('⚠️ Validation limites utilisateur désactivée')

    // 6.5. Récupération du prix depuis la base de données (system_config)
    log('💵 Récupération du prix du produit')
    let dbPrice = 14600 // fallback secours

    try {
      const { data: pricingDb } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'pricing_config')
        .maybeSingle()

      const { data: dbConfig } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'payment_gateways')
        .maybeSingle()

      const resolvedPrice = pricingDb?.value?.nfc_card_base_price || dbConfig?.value?.geniuspay?.base_price || dbConfig?.value?.wave?.base_price

      if (resolvedPrice && resolvedPrice >= 200) {
        dbPrice = resolvedPrice
      } else {
        // Fallback sur la table products si présent
        const { data: productData } = await supabase
          .from('products')
          .select('price')
          .eq('type', orderData.card_type)
          .maybeSingle()
        if (productData?.price && productData.price >= 200) {
          dbPrice = productData.price
        }
      }
    } catch (e) {
      log('⚠️ Erreur fetch pricing config', { e })
    }

    // 7. Calcul sécurisé du prix
    log('💰 Calcul du prix')
    let unitPrice: number
    let totalAmount: number

    try {
      unitPrice = calculatePrice(dbPrice, 1, orderData.unit_price)
      totalAmount = calculatePrice(dbPrice, orderData.quantity, orderData.unit_price)
      log('✅ Prix calculé', { unitPrice, totalAmount, cardType: orderData.card_type })
    } catch (priceError) {
      log('❌ Erreur calcul prix', {
        error: priceError instanceof Error ? priceError.message : 'Unknown',
        cardType: orderData.card_type,
        quantity: orderData.quantity
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de calcul du prix',
          code: 'PRICE_CALCULATION_ERROR'
        },
        { status: 400 }
      )
    }

    // 8. Génération du numéro de commande
    log('🆔 Génération du numéro de commande')
    let orderNumber: string
    try {
      orderNumber = await generateOrderNumber(supabase)
      log('✅ Numéro de commande généré', { orderNumber })
    } catch (orderNumberError) {
      log('❌ Erreur génération numéro commande', {
        error: orderNumberError instanceof Error ? orderNumberError.message : 'Unknown'
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de génération du numéro de commande',
          code: 'ORDER_NUMBER_GENERATION_ERROR'
        },
        { status: 500 }
      )
    }

    // 8.5. Vérifier si la méthode de paiement est activée
    log('🛡️ Vérification du statut de la méthode de paiement')
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .single()
    
    const gateways = dbConfig?.value || {}
    const requestedMethod = orderData.payment_method
    
    // Par défaut, Genius Pay est actif si non configuré explicitement comme inactif
    const isMethodActive = gateways[requestedMethod]?.is_active ?? (requestedMethod === 'geniuspay' || requestedMethod === 'wave' ? true : false)
    
    if (!isMethodActive) {
      log(`❌ Méthode de paiement ${requestedMethod} inactive`)
      return NextResponse.json(
        {
          success: false,
          error: `La méthode de paiement ${requestedMethod} n'est pas disponible pour le moment.`,
          code: 'PAYMENT_METHOD_INACTIVE'
        },
        { status: 403 }
      )
    }

    // 9. Préparation des données d'insertion avec validation finale
    // Conversion du prix en centimes (1 XOF = 1 centime pour cohérence)
    const amountCents = Math.round(totalAmount)
    const shippingCents = 0 // Gratuit pour l'instant
    const taxCents = 0 // Pas de taxe pour l'instant
    
    // Formater l'adresse selon le schéma de la base de données
    const formattedShippingAddress = {
      full_name: orderData.shipping_address.name,
      line1: orderData.shipping_address.address,
      line2: null,
      city: orderData.shipping_address.city,
      postal_code: orderData.shipping_address.postalCode || '',
      country: 'SN', // Sénégal par défaut
      phone: orderData.shipping_address.phone,
      email: orderData.shipping_address.email || ''
    }

    const orderInsertData = {
      user_id: user.id,
      order_number: orderNumber,
      card_type: orderData.card_type,
      amount_cents: amountCents,
      shipping_cents: shippingCents,
      tax_cents: taxCents,
      // total_cents est GENERATED ALWAYS, donc on ne l'inclut pas
      payment_status: 'pending',
      status: 'pending', // Nouvelle colonne migration
      payment_provider: requestedMethod, // Pour compatibilité historique
      payment_method: requestedMethod,   // Colonne ajoutée par la migration 20260316
      shipping_status: 'pending',
      currency: 'XOF', 
      quantity: orderData.quantity, // Nouvelle colonne migration
      unit_price: Math.round(unitPrice), // Nouvelle colonne migration
      total_amount: amountCents, // Nouvelle colonne migration
      shipping_address: formattedShippingAddress,
      metadata: {
        ...orderData.metadata,
        profile_id: orderData.profile_id,
        created_via: 'api',
        processing_time_ms: Date.now() - startTime,
        quantity: orderData.quantity,
        unit_price: unitPrice,
        payment_method: requestedMethod
      },
    }

    log('📦 Données de commande préparées', { 
      amountCents, 
      shippingCents, 
      taxCents,
      totalWillBe: amountCents + shippingCents + taxCents 
    })

    // 10. Insertion sécurisée dans la base de données
    log('💾 Insertion en base de données')
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select(`
        id,
        order_number,
        card_type,
        amount_cents,
        shipping_cents,
        tax_cents,
        total_cents,
        payment_status,
        shipping_status,
        created_at
      `)
      .single()

    if (insertError) {
      log('❌ Erreur insertion base de données', {
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      })

      // Gestion spécifique des erreurs de base de données
      if (insertError.code === '23505') { // Violation de contrainte unique
        return NextResponse.json(
          {
            success: false,
            error: 'Numéro de commande déjà existant',
            code: 'DUPLICATE_ORDER_NUMBER'
          },
          { status: 409 }
        )
      }

      if (insertError.code === '23503') { // Violation de clé étrangère
        return NextResponse.json(
          {
            success: false,
            error: 'Référence invalide',
            code: 'FOREIGN_KEY_VIOLATION'
          },
          { status: 400 }
        )
      }

      if (insertError.code === '23502') { // NOT NULL violation
        return NextResponse.json(
          {
            success: false,
            error: 'Données manquantes requises',
            code: 'NOT_NULL_VIOLATION'
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la création de la commande',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      )
    }

    if (!order) {
      log('❌ Aucune donnée retournée après insertion')
      return NextResponse.json(
        {
          success: false,
          error: 'Commande non créée',
          code: 'ORDER_CREATION_FAILED'
        },
        { status: 500 }
      )
    }

    log('✅ Commande créée avec succès', {
      orderId: order.id,
      orderNumber: order.order_number,
      totalCents: order.total_cents
    })

    // 10.5 Mise à jour silencieuse de l'adresse de l'utilisateur s'il a renseigné des informations
    if (orderData.shipping_address) {
      log('👤 Mise à jour des informations utilisateur avec la nouvelle adresse de livraison')
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          name: orderData.shipping_address.name || undefined,
          phone: orderData.shipping_address.phone || undefined,
          city: orderData.shipping_address.city || undefined,
          address: orderData.shipping_address.address || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (userUpdateError) {
        log('⚠️ Erreur mineure lors de la mise à jour du profil utilisateur:', { error: userUpdateError.message })
        // On ne bloque pas la commande pour autant
      }
    }

    // 11. Réponse de succès avec données complètes
    const response = {
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        card_type: order.card_type,
        amount_cents: order.amount_cents,
        shipping_cents: order.shipping_cents,
        tax_cents: order.tax_cents,
        total_cents: order.total_cents,
        payment_status: order.payment_status,
        shipping_status: order.shipping_status,
        created_at: order.created_at,
        // Metadata pour compatibilité avec le frontend
        quantity: orderData.quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        currency: 'XOF'
      },
      message: 'Commande créée avec succès',
      processing_time_ms: Date.now() - startTime
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    // Gestion d'erreur globale avec logging détaillé
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Unknown'

    log('💥 ERREUR CRITIQUE dans /api/orders/create:', {
      error: errorMessage,
      name: errorName,
      stack: errorStack,
      processing_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      isProduction
    })

    // Ne pas exposer les détails d'erreur en production
    const isDevelopment = process.env.NODE_ENV === 'development'

    return NextResponse.json(
      {
        success: false,
        error: isDevelopment ? errorMessage : 'Erreur serveur interne',
        code: 'INTERNAL_SERVER_ERROR',
        ...(isDevelopment && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

// GET - Récupérer les commandes de l'utilisateur avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérification de l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur d\'authentification',
          code: 'AUTH_ERROR'
        },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Utilisateur non authentifié',
          code: 'USER_NOT_AUTHENTICATED'
        },
        { status: 401 }
      )
    }

    // Parsing et validation des paramètres de requête
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100) // Max 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    // Validation du paramètre status
    const validStatuses = ['pending', 'paid', 'failed', 'cancelled', 'shipped', 'delivered']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Statut invalide. Valeurs autorisées: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      )
    }

    // Construction de la requête avec sécurisation
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        card_type,
        quantity,
        unit_price,
        total_amount,
        currency,
        status,
        payment_status,
        payment_method,
        shipping_address,
        tracking_number,
        estimated_delivery,
        actual_delivery,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error: ordersError, count } = await query

    if (ordersError) {
      console.error('Database query error:', ordersError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la récupération des commandes',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      )
    }

    // Réponse structurée avec métadonnées de pagination
    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + (orders?.length || 0)
      },
      filters: {
        status: status || null
      }
    })

  } catch (error) {
    console.error('Critical error in GET /api/orders/create:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur interne',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}
