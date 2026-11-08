import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { apiHandler, apiError, apiSuccess } from '@/lib/utils/api-handler'
import { z } from 'zod'
import { securitySchemas } from '@/lib/security/input-validation'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'


// GET - Récupérer les informations d'un utilisateur
export const GET = withAuth(async (request, authUser, params: { id: string }) => {
  const adminSupabase = createAdminClient()

  // Autoriser si c'est soi-même OU si c'est un administrateur
  if (authUser.id !== params.id) {
    const { data: adminRecord } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    const role = adminRecord?.role || (authUser.app_metadata as any)?.role
    if (role !== 'admin' && role !== 'super_admin') {
      return apiError.forbidden('Vous ne pouvez consulter que vos propres données')
    }
  }
  
  // 1. Chercher dans la table 'users'
  let { data: user, error } = await adminSupabase
    .from('users')
    .select('id, name, first_name, last_name, email, phone, city, address, image, preferred_language, subscription_tier, role, created_at')
    .eq('id', params.id)
    .maybeSingle()

  // 2. Si l'utilisateur n'existe pas encore dans public.users et qu'il consulte son propre compte, on l'initialise automatiquement
  if (!user && authUser.id === params.id) {
    const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Utilisateur'
    const firstName = authUser.user_metadata?.first_name || fullName.split(' ')[0] || ''
    const lastName = authUser.user_metadata?.last_name || ''
    const avatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || ''

    try {
      const { data: createdUser, error: insertError } = await adminSupabase
        .from('users')
        .upsert({
          id: params.id,
          email: authUser.email,
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          image: avatar,
          subscription_tier: 'free',
          role: 'client',
          updated_at: new Date().toISOString()
        })
        .select('id, name, first_name, last_name, email, phone, city, address, image, preferred_language, subscription_tier, role, created_at')
        .maybeSingle()

      if (!insertError && createdUser) {
        user = createdUser
      } else {
        user = {
          id: authUser.id,
          email: authUser.email,
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone: null,
          city: null,
          address: null,
          image: avatar,
          preferred_language: 'fr',
          subscription_tier: 'free',
          role: 'client',
          created_at: authUser.created_at
        } as any
      }
    } catch (e) {
      console.warn('[API GET USER] Erreur auto-provisioning user:', e)
    }
  }

  if (!user) {
    return apiError.notFound('Compte utilisateur non trouvé')
  }

  // Utiliser l'email de la base de données s'il existe, sinon l'email d'Auth
  const userWithEmail = {
    ...user,
    email: user.email || authUser.email
  }

  return apiSuccess.ok(userWithEmail)
})

// PUT - Mettre à jour les informations d'un utilisateur
export const PUT = withAuth(async (request, authUser, params: { id: string }) => {
  // Vérifier que l'utilisateur modifie ses propres données
  if (authUser.id !== params.id) {
    return apiError.forbidden('Vous ne pouvez modifier que vos propres données')
  }

  const supabase = await createClient()
  const body = await request.json()

  // SÉCURITÉ : Validation stricte des entrées (A03: Injection)
  const updateSchema = z.object({
    name: securitySchemas.name.optional(),
    first_name: securitySchemas.name.optional(),
    last_name: securitySchemas.name.optional(),
    phone: securitySchemas.phone.optional(),
    city: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    image: securitySchemas.url.optional().or(z.literal('')).optional(),
    preferred_language: z.string().min(2).max(5).optional(),
    email: securitySchemas.email.optional()
  })

  const validation = updateSchema.safeParse(body)
  if (!validation.success) {
    return apiError.badRequest(validation.error.issues[0].message)
  }

  const validatedData = validation.data
  const updateData: any = { ...validatedData }

  // Normaliser l'email
  const emailToUpdate = validatedData.email && validatedData.email !== authUser.email 
    ? validatedData.email 
    : undefined

  // Ajouter la date de mise à jour
  updateData.updated_at = new Date().toISOString()

  logger.info('Mise à jour utilisateur', { userId: params.id, fields: Object.keys(updateData) })

  // Mettre à jour dans la base de données users
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('users')
    .update(updateData)
    .eq('id', params.id)
    .select('id, name, first_name, last_name, email, phone, city, address, image, preferred_language, subscription_tier, updated_at')
    .single()

  if (error) {
    logger.error('Erreur mise à jour DB users', { error, userId: params.id })
    return apiError.serverError(`Erreur lors de la mise à jour: ${error.message}`)
  }

  // Mettre à jour l'email dans Supabase Auth UNIQUEMENT si c'est un NOUVEAU email
  if (emailToUpdate) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: emailToUpdate
    })

    if (emailError) {
      logger.error('Erreur mise à jour Auth email', { error: emailError, userId: params.id })
      // Ne pas bloquer la requête
    }
  }

  return apiSuccess.ok(data, 'Profil mis à jour avec succès')
})

// DELETE - Désactiver un compte utilisateur (soft delete)
export const DELETE = withAuth(async (request, authUser, params: { id: string }) => {
  // Vérifier que l'utilisateur supprime son propre compte
  if (authUser.id !== params.id) {
    return apiError.forbidden('Vous ne pouvez supprimer que votre propre compte')
  }

  const supabase = await createClient()
  
  // Récupérer le mot de passe de confirmation du body
  const body = await request.json()
  
  if (!body.password) {
    return apiError.badRequest('Mot de passe requis pour confirmer la suppression')
  }

  // Vérifier le mot de passe
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.email!,
    password: body.password
  })

  if (signInError) {
    return apiError.unauthorized('Mot de passe incorrect')
  }

  // Désactiver le compte (soft delete) - Mise à jour de Users
  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)

  if (updateError) {
    console.error('Error deactivating user:', updateError)
    return apiError.serverError('Erreur lors de la désactivation du compte')
  }

  // Désactiver les profils associés
  const { error: profilesError } = await supabase
    .from('profiles')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', params.id)

  if (profilesError) {
    console.error('Error deactivating user profiles:', profilesError)
  }

  // Désactiver les cartes NFC virtuelles associées
  const { error: nfcError } = await supabase
    .from('digital_nfc_cards')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', params.id)

  if (nfcError) {
    console.error('Error deactivating digital NFC cards:', nfcError)
  }

  // Déconnecter l'utilisateur
  await supabase.auth.signOut()

  return apiSuccess.ok({ success: true }, 'Compte désactivé avec succès')
})
