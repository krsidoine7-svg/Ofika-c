// =====================================================
// API ROUTE: POST /api/profiles
// Description: Crée un profil avec données de template
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  baseProfileSchema, 
  createDynamicTemplateSchema,
  validateCustomUrl,
  removeEmptyFields
} from '@/lib/validation/profile-schemas'
import { TemplateSchema } from '@/lib/types/template'

export const dynamic = 'force-dynamic'

/**
 * POST /api/profiles
 * Crée un nouveau profil avec données de base + template
 * 
 * Body: {
 *   baseFields: { name, bio, email, custom_url, ... },
 *   templateId: string,
 *   templateFields?: { [key]: value }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    // Parser le body
    const body = await request.json()
    const { baseFields, templateId, templateFields = {} } = body
    
    if (!baseFields || !templateId) {
      return NextResponse.json(
        { error: 'baseFields et templateId sont requis' },
        { status: 400 }
      )
    }
    
    // ===================================
    // 1. Valider les champs de base
    // ===================================
    const baseValidation = baseProfileSchema.safeParse(baseFields)
    
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
    
    const validatedBaseFields = baseValidation.data
    
    // Vérifier que l'URL personnalisée n'est pas réservée
    const urlCheck = validateCustomUrl(validatedBaseFields.custom_url)
    if (!urlCheck.valid) {
      return NextResponse.json(
        { error: urlCheck.error },
        { status: 400 }
      )
    }
    
    // Vérifier que l'URL personnalisée n'est pas déjà prise
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('custom_url', validatedBaseFields.custom_url)
      .single()
    
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Cette URL personnalisée est déjà utilisée' },
        { status: 409 }
      )
    }
    
    // ===================================
    // 2. Récupérer et valider le template
    // ===================================
    const { data: template, error: templateError } = await supabase
      .from('template_schemas')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()
    
    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      )
    }
    
    const typedTemplate = template as TemplateSchema
    
    // Valider les champs du template si présents
    let validatedTemplateFields = {}
    
    if (typedTemplate.schema.fields.length > 0) {
      const templateSchema = createDynamicTemplateSchema(typedTemplate.schema.fields)
      const templateValidation = templateSchema.safeParse(templateFields)
      
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
      
      validatedTemplateFields = templateValidation.data
    }
    
    // ===================================
    // 3. Générer un username unique si non fourni
    // ===================================
    let username = validatedBaseFields.custom_url
    
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()
    
    if (existingUsername) {
      // Ajouter un suffixe numérique
      let counter = 1
      let uniqueUsername = `${username}-${counter}`
      
      while (true) {
        const { data: checkUsername } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', uniqueUsername)
          .single()
        
        if (!checkUsername) break
        counter++
        uniqueUsername = `${username}-${counter}`
        
        if (counter > 100) {
          return NextResponse.json(
            { error: 'Impossible de générer un nom d\'utilisateur unique' },
            { status: 500 }
          )
        }
      }
      
      username = uniqueUsername
    }
    
    // ===================================
    // 4. Créer le profil
    // ===================================
    const profileData = {
      user_id: user.id,
      ...removeEmptyFields(validatedBaseFields),
      username,
      design_choice: typedTemplate.slug,
      is_active: true
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil' },
        { status: 500 }
      )
    }
    
    // ===================================
    // 5. Sauvegarder les données du template
    // ===================================
    if (Object.keys(validatedTemplateFields).length > 0) {
      const { error: templateDataError } = await supabase
        .from('profile_template_data')
        .insert({
          profile_id: profile.id,
          template_id: templateId,
          fields: validatedTemplateFields,
          metadata: {
            created_via: 'api',
            field_count: Object.keys(validatedTemplateFields).length
          }
        })
      
      if (templateDataError) {
        console.error('Error saving template data:', templateDataError)
        // Ne pas fail complètement, juste logger
      }
    }
    
    // ===================================
    // 6. Analytics event - Enregistrement réel dans la base de données
    // ===================================
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert({
        profile_id: profile.id,
        event_type: 'profile_created',
        event_data: {
          template_name: typedTemplate.name,
          template_id: templateId,
          has_template_fields: Object.keys(validatedTemplateFields).length > 0,
          total_fields: Object.keys(validatedBaseFields).length + Object.keys(validatedTemplateFields).length,
          user_id: user.id
        },
        user_agent: request.headers.get('user-agent') || undefined,
        created_at: new Date().toISOString()
      })

    if (analyticsError) {
      console.error('📊 Error tracking profile creation:', analyticsError)
    } else {
      console.log('📊 Profile created event tracked in database:', profile.id)
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        template: typedTemplate,
        template_fields: validatedTemplateFields
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Unexpected error in POST /api/profiles:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
