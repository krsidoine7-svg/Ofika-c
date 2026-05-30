import { NextRequest, NextResponse } from 'next/server'

/**
 * Wrapper générique pour la gestion des erreurs dans les routes API
 * Élimine la duplication du try-catch et de la gestion d'erreurs
 * 
 * @example
 * export const GET = apiHandler(async (request) => {
 *   const data = await fetchData()
 *   return NextResponse.json({ success: true, data })
 * })
 */
export function apiHandler<T = any>(
  handler: (request: NextRequest, context?: { params: T }) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context?: { params: T }
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      
      // Gestion spécifique des erreurs Supabase
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any
        
        if (supabaseError.code === '23505') {
          return NextResponse.json(
            { success: false, error: 'Cette ressource existe déjà' },
            { status: 409 }
          )
        }
        
        if (supabaseError.code === '23503') {
          return NextResponse.json(
            { success: false, error: 'Ressource liée introuvable' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur interne du serveur',
          ...(process.env.NODE_ENV === 'development' && {
            details: error instanceof Error ? error.message : String(error)
          })
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper pour créer des réponses d'erreur standardisées
 */
export const apiError = {
  unauthorized: (message = 'Non authentifié') =>
    NextResponse.json({ success: false, error: message }, { status: 401 }),
  
  forbidden: (message = 'Accès refusé') =>
    NextResponse.json({ success: false, error: message }, { status: 403 }),
  
  notFound: (message = 'Ressource non trouvée') =>
    NextResponse.json({ success: false, error: message }, { status: 404 }),
  
  badRequest: (message: string, details?: any) =>
    NextResponse.json(
      { success: false, error: message, ...(details && { details }) },
      { status: 400 }
    ),
  
  conflict: (message = 'Conflit de ressource') =>
    NextResponse.json({ success: false, error: message }, { status: 409 }),
  
  serverError: (message = 'Erreur interne du serveur') =>
    NextResponse.json({ success: false, error: message }, { status: 500 })
}

/**
 * Helper pour créer des réponses de succès standardisées
 */
export const apiSuccess = {
  ok: <T>(data: T, message?: string) =>
    NextResponse.json({
      success: true,
      ...(message && { message }),
      ...(data && { data })
    }),
  
  created: <T>(data: T, message?: string) =>
    NextResponse.json(
      {
        success: true,
        ...(message && { message }),
        ...(data && { data })
      },
      { status: 201 }
    ),
  
  noContent: () => new NextResponse(null, { status: 204 })
}
