import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { apiError, apiSuccess } from '@/lib/utils/api-handler'

export const dynamic = 'force-dynamic'


// POST - Changer le mot de passe
export const POST = withAuth(async (request, user) => {
  const supabase = await createClient()
  
  let body: any
  try {
    body = await request.json()
  } catch {
    return apiError.badRequest('Format JSON invalide')
  }

  const { currentPassword, newPassword } = body || {}

  if (!currentPassword || !newPassword) {
    return apiError.badRequest('Mot de passe actuel et nouveau mot de passe requis')
  }

  if (newPassword.length < 6) {
    return apiError.badRequest('Le nouveau mot de passe doit contenir au moins 6 caractères')
  }

  if (!user.email) {
    return apiError.badRequest('Adresse e-mail introuvable pour cet utilisateur')
  }

  // Vérifier le mot de passe actuel
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })

  if (signInError) {
    return apiError.badRequest('Mot de passe actuel incorrect')
  }

  // Mettre à jour le mot de passe
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword
  })

  if (updateError) {
    console.error('Error updating password:', updateError)
    return apiError.badRequest(updateError.message || 'Erreur lors de la mise à jour du mot de passe')
  }

  return apiSuccess.ok(
    { success: true },
    'Mot de passe mis à jour avec succès'
  )
})
