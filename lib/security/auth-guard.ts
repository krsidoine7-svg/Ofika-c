import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InputSanitizer } from './input-sanitizer'

/**
 * Service de protection des routes et validation d'authentification
 */

export class AuthGuard {
  /**
   * Vérifie l'authentification utilisateur
   */
  static async verifyAuth(request: NextRequest) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return {
          success: false,
          user: null,
          error: 'Non authentifié'
        }
      }
      
      return {
        success: true,
        user,
        error: null
      }
    } catch (error) {
      console.error('Erreur de vérification auth:', error)
      return {
        success: false,
        user: null,
        error: 'Erreur de vérification'
      }
    }
  }

  /**
   * Vérifie que l'utilisateur possède une ressource
   */
  static async verifyOwnership(
    supabase: any,
    table: string,
    resourceId: string,
    userId: string,
    userColumn: string = 'user_id'
  ) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('id', resourceId)
        .eq(userColumn, userId)
        .single()
      
      if (error || !data) {
        return {
          success: false,
          error: 'Ressource non trouvée ou accès refusé'
        }
      }
      
      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('Erreur de vérification ownership:', error)
      return {
        success: false,
        error: 'Erreur de vérification'
      }
    }
  }

  /**
   * Valide et sanitise les données de requête
   */
  static validateRequestData(data: any, schema: any) {
    try {
      // Sanitisation des données
      const sanitizedData = InputSanitizer.sanitizeObject(data)
      
      // Validation avec le schéma
      const validatedData = schema.parse(sanitizedData)
      
      return {
        success: true,
        data: validatedData,
        error: null
      }
    } catch (error) {
      console.error('Erreur de validation:', error)
      return {
        success: false,
        data: null,
        error: 'Données invalides'
      }
    }
  }

  /**
   * Middleware pour protéger les routes API
   */
  static async protectRoute(
    request: NextRequest,
    options: {
      requireAuth?: boolean
      allowedMethods?: string[]
      validateData?: boolean
      schema?: any
    } = {}
  ) {
    const {
      requireAuth = true,
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
      validateData = false,
      schema
    } = options

    // Vérifier la méthode HTTP
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json(
        { error: 'Méthode non autorisée' },
        { status: 405 }
      )
    }

    // Vérifier l'authentification si requise
    if (requireAuth) {
      const authResult = await this.verifyAuth(request)
      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error },
          { status: 401 }
        )
      }
    }

    // Valider les données si requis
    if (validateData && schema && request.method !== 'GET') {
      try {
        const body = await request.json()
        const validation = this.validateRequestData(body, schema)
        
        if (!validation.success) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          )
        }
        
        // Ajouter les données validées à la requête
        (request as any).validatedData = validation.data
      } catch (error) {
        return NextResponse.json(
          { error: 'Données JSON invalides' },
          { status: 400 }
        )
      }
    }

    return null // Continuer la requête
  }

  /**
   * Vérifie les permissions utilisateur
   */
  static async checkPermissions(
    supabase: any,
    userId: string,
    action: string,
    resource?: string
  ) {
    try {
      // 1. Vérifier le rôle de l'utilisateur dans la table users
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (!userError && user && (user.role === 'admin' || user.role === 'super_admin')) {
        // S'il est super_admin, il a ["all"]
        if (user.role === 'super_admin') return { success: true, error: null }
        
        const rolePermissions = this.getRolePermissions(user.role)
        if (rolePermissions.includes(action)) return { success: true, error: null }
      }

      if (userError || !user) {
        return { success: false, error: 'Utilisateur non trouvé' }
      }

      const userPermissions = this.getRolePermissions('user')
      if (userPermissions.includes(action)) return { success: true, error: null }

      return {
        success: false,
        error: 'Permission insuffisante'
      }
    } catch (error) {
      console.error('Erreur de vérification permissions:', error)
      return {
        success: false,
        error: 'Erreur de vérification'
      }
    }
  }

  /**
   * Définit les permissions par rôle
   */
  private static getRolePermissions(role: string): string[] {
    const permissions = {
      super_admin: ['all', 'read:all', 'write:all', 'delete:all', 'manage:users', 'manage:orders', 'manage:analytics', 'manage:admins'],
      admin: [
        'read:all',
        'write:all',
        'delete:all',
        'manage:users',
        'manage:orders',
        'manage:analytics'
      ],
      user: [
        'read:own',
        'write:own',
        'delete:own',
        'create:profiles',
        'create:orders'
      ],
      guest: [
        'read:public'
      ]
    }

    return permissions[role as keyof typeof permissions] || (role === 'super_admin' ? permissions.super_admin : (role === 'admin' ? permissions.admin : permissions.guest))
  }
}
