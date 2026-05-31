// =====================================================
// API ROUTE: GET/PUT/DELETE /api/profiles/[id]
// Description: CRUD sur un profil spécifique
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  baseProfileSchema, 
  createDynamicTemplateSchema,
  removeEmptyFields
} from '@/lib/validation/profile-schemas'
import { TemplateSchema, ProfileWithTemplate } from '@/lib/types/template'
import { revalidateProfile } from '@/lib/services/public-profile'

export const dynamic = 'force-dynamic'

/**
 * GET /api/profiles/[id]
 * Récupère un profil avec ses données de template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    // Récupérer le profil (champs explicites)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, name, username, bio, image_url, background_image_url, social_links, custom_links, design_choice, primary_color, is_public, is_active, custom_url, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }
    
    // Récupérer le template
    const { data: template } = await supabase
      .from('template_schemas')
      .select('*')
      .eq('slug', profile.design_choice)
      .eq('is_active', true)
      .single()
    
    // Récupérer les données du template
    const { data: templateData } = await supabase
      .from('profile_template_data')
      .select('*')
      .eq('profile_id', id)
      .single()
    
    const enrichedProfile: ProfileWithTemplate = {
      ...profile,
      template: template as TemplateSchema | undefined,
      template_data: templateData || undefined
    }
    
    return NextResponse.json({ profile: enrichedProfile })
    
  } catch (error) {
    console.error('Unexpected error in GET /api/profiles/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/profiles/[id]
 * Met à jour un profil et ses données de template
 * 
 * Body: {
 *   baseFields?: { name, bio, ... },
 *   templateFields?: { [key]: value }
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    // Vérifier que le profil appartient à l'utilisateur
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*, design_choice')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (checkError || !existingProfile) {
      return NextResponse.json(
        { error: 'Profil non trouvé ou non autorisé' },
        { status: 404 }
      )
    }
    
    // Parser le body
    const body = await request.json()
    const { baseFields, templateFields } = body
    
    let updatedProfile = existingProfile
    const changedFields: string[] = []
    
    // ===================================
    // 1. Mettre à jour les champs de base
    // ===================================
    if (baseFields && Object.keys(baseFields).length > 0) {
      const baseValidation = baseProfileSchema.partial().safeParse(baseFields)
      
      if (!baseValidation.success) {
        const errors = baseValidation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
        
        return NextResponse.json(
          { 
            error: 'Validation des champs de base échouée', 
            details: errors 
          },
          { status: 400 }
        )
      }
      
      const validatedBaseFields = removeEmptyFields(baseValidation.data)
      
      // Si custom_url change, vérifier qu'elle n'est pas prise
      if (validatedBaseFields.custom_url && 
          validatedBaseFields.custom_url !== existingProfile.custom_url) {
        const { data: urlTaken } = await supabase
          .from('profiles')
          .select('id')
          .eq('custom_url', validatedBaseFields.custom_url)
          .neq('id', id)
          .single()
        
        if (urlTaken) {
          return NextResponse.json(
            { error: 'Cette URL personnalisée est déjà utilisée' },
            { status: 409 }
          )
        }
      }
      
      // Mettre à jour le profil
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...validatedBaseFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating profile:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil' },
          { status: 500 }
        )
      }
      
      updatedProfile = updated
      changedFields.push(...Object.keys(validatedBaseFields))
    }
    
    // ===================================
    // 2. Mettre à jour les données du template
    // ===================================
    if (templateFields && Object.keys(templateFields).length > 0) {
      // Récupérer le template actuel
      const { data: template } = await supabase
        .from('template_schemas')
        .select('*')
        .eq('slug', updatedProfile.design_choice)
        .eq('is_active', true)
        .single()
      
      if (!template) {
        return NextResponse.json(
          { error: 'Template non trouvé' },
          { status: 404 }
        )
      }
      
      const typedTemplate = template as TemplateSchema
      
      // Valider les champs du template
      if (typedTemplate.schema.fields.length > 0) {
        const templateSchema = createDynamicTemplateSchema(typedTemplate.schema.fields)
        const templateValidation = templateSchema.partial().safeParse(templateFields)
        
        if (!templateValidation.success) {
          const errors = templateValidation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
          
          return NextResponse.json(
            { 
              error: 'Validation des champs du template échouée', 
              details: errors 
            },
            { status: 400 }
          )
        }
        
        const validatedTemplateFields = removeEmptyFields(templateValidation.data)
        
        // Vérifier si une entrée existe déjà
        const { data: existingTemplateData } = await supabase
          .from('profile_template_data')
          .select('id, fields')
          .eq('profile_id', id)
          .single()
        
        if (existingTemplateData) {
          // Mettre à jour (merge avec les données existantes)
          const mergedFields = {
            ...existingTemplateData.fields,
            ...validatedTemplateFields
          }
          
          const { error: updateTemplateError } = await supabase
            .from('profile_template_data')
            .update({
              fields: mergedFields,
              metadata: {
                last_modified_field: Object.keys(validatedTemplateFields)[0],
                updated_via: 'api'
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTemplateData.id)
          
          if (updateTemplateError) {
            console.error('Error updating template data:', updateTemplateError)
          }
        } else {
          // Créer une nouvelle entrée
          const { error: insertTemplateError } = await supabase
            .from('profile_template_data')
            .insert({
              profile_id: id,
              template_id: typedTemplate.id,
              fields: validatedTemplateFields,
              metadata: {
                created_via: 'api_update'
              }
            })
          
          if (insertTemplateError) {
            console.error('Error inserting template data:', insertTemplateError)
          }
        }
        
        changedFields.push(...Object.keys(validatedTemplateFields).map(f => `template.${f}`))
      }
    }
    
    // ===================================
    // 3. Analytics event
    // ===================================
    console.log('📊 Profile updated event tracked:', {
      user_id: user.id,
      profile_id: id,
      changed_fields: changedFields,
      base_fields_updated: baseFields ? Object.keys(baseFields) : [],
      template_fields_updated: templateFields ? Object.keys(templateFields) : [],
      total_changes: changedFields.length,
      updated_at: new Date().toISOString()
    })
    
    // Récupérer le profil complet avec template
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    const { data: template } = await supabase
      .from('template_schemas')
      .select('*')
      .eq('slug', finalProfile.design_choice)
      .single()
    
    const { data: templateData } = await supabase
      .from('profile_template_data')
      .select('*')
      .eq('profile_id', id)
      .single()
    
    
    // Invalider le cache car le profil a été mis à jour
    if (existingProfile.username) {
      await revalidateProfile(existingProfile.username)
    }
    if (existingProfile.custom_url) {
      await revalidateProfile(existingProfile.custom_url)
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        ...finalProfile,
        template,
        template_data: templateData
      },
      changed_fields: changedFields
    })
    
  } catch (error) {
    console.error('Unexpected error in PUT /api/profiles/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles/[id]
 * Supprime un profil (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    // Soft delete: désactiver le profil
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting profile:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du profil' },
        { status: 500 }
      )
    }
    
    
    // Invalider le cache car le profil a été supprimé (soft delete)
    // On pourrait chercher le username ici car on ne l'a pas directement, 
    // ou simplement invalider le tag global.
    await revalidateProfile('global') // 'global' n'est pas utilisé mais la fonction invalide le tag generic
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Unexpected error in DELETE /api/profiles/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
