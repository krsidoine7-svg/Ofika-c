/**
 * ✅ FIX: Helpers pour réponses API Next.js
 * Garantit des réponses JSON correctes avec les bons headers
 */

import { NextResponse } from 'next/server'

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * ✅ Réponse de succès avec headers corrects
 */
export function apiSuccess<T = any>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

/**
 * ✅ Réponse d'erreur avec headers corrects
 */
export function apiError(
  error: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

/**
 * ✅ Réponse 400 Bad Request
 */
export function apiBadRequest(
  error: string = 'Bad Request',
  details?: any
): NextResponse<ApiErrorResponse> {
  return apiError(error, 400, 'BAD_REQUEST', details)
}

/**
 * ✅ Réponse 401 Unauthorized
 */
export function apiUnauthorized(
  error: string = 'Unauthorized',
  details?: any
): NextResponse<ApiErrorResponse> {
  return apiError(error, 401, 'UNAUTHORIZED', details)
}

/**
 * ✅ Réponse 403 Forbidden
 */
export function apiForbidden(
  error: string = 'Forbidden',
  details?: any
): NextResponse<ApiErrorResponse> {
  return apiError(error, 403, 'FORBIDDEN', details)
}

/**
 * ✅ Réponse 404 Not Found
 */
export function apiNotFound(
  error: string = 'Not Found',
  details?: any
): NextResponse<ApiErrorResponse> {
  return apiError(error, 404, 'NOT_FOUND', details)
}

/**
 * ✅ Réponse 406 Not Acceptable (corrige l'erreur 406)
 */
export function apiNotAcceptable(
  error: string = 'Not Acceptable',
  details?: any
): NextResponse<ApiErrorResponse> {
  return apiError(error, 406, 'NOT_ACCEPTABLE', details)
}

/**
 * ✅ Réponse 500 Internal Server Error
 */
export function apiInternalError(
  error: string = 'Internal Server Error',
  details?: any
): NextResponse<ApiErrorResponse> {
  return apiError(error, 500, 'INTERNAL_ERROR', details)
}

/**
 * ✅ Wrapper try/catch pour routes API
 * Gère automatiquement les erreurs et retourne une réponse JSON correcte
 */
export async function apiHandler<T = any>(
  handler: () => Promise<NextResponse<ApiSuccessResponse<T>>>,
  errorHandler?: (error: any) => NextResponse<ApiErrorResponse>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    return await handler()
  } catch (error: any) {
    console.error('[API Error]', error)

    if (errorHandler) {
      return errorHandler(error)
    }

    // Erreur par défaut
    return apiInternalError(
      error.message || 'Une erreur est survenue',
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    )
  }
}

/**
 * ✅ Valider les paramètres de requête
 */
export function validateParams(
  params: Record<string, any>,
  required: string[]
): { valid: boolean; missing?: string[] } {
  const missing = required.filter(key => !params[key])
  
  if (missing.length > 0) {
    return { valid: false, missing }
  }
  
  return { valid: true }
}

/**
 * ✅ Parser le body JSON de manière sécurisée
 */
export async function parseJsonBody<T = any>(
  request: Request
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const contentType = request.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: 'Content-Type must be application/json',
      }
    }

    const data = await request.json()
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: 'Invalid JSON body',
    }
  }
}
