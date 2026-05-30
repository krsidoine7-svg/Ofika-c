/**
 * ✅ FIX: Wrapper fetch sécurisé pour éviter les erreurs 406 et gérer les erreurs proprement
 * Garantit des headers corrects et une gestion d'erreur robuste
 */

export interface SafeFetchOptions extends RequestInit {
  /** Timeout en millisecondes (défaut: 10000ms) */
  timeout?: number
  /** Retry automatique en cas d'échec (défaut: false) */
  retry?: boolean
  /** Nombre de tentatives (défaut: 3) */
  retries?: number
  /** Log les erreurs dans la console (défaut: true) */
  logErrors?: boolean
}

export interface SafeFetchResponse<T = any> {
  /** Succès de la requête */
  success: boolean
  /** Données de la réponse */
  data?: T
  /** Message d'erreur */
  error?: string
  /** Code de statut HTTP */
  status?: number
  /** Headers de la réponse */
  headers?: Headers
}

/**
 * Fetch sécurisé avec headers corrects et gestion d'erreur
 * ✅ Corrige l'erreur 406 en ajoutant automatiquement les bons headers
 */
export async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  const {
    timeout = 10000,
    retry = false,
    retries = 3,
    logErrors = true,
    ...fetchOptions
  } = options

  // 🔧 Headers par défaut pour éviter l'erreur 406
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  // Fusionner avec les headers fournis
  const headers = {
    ...defaultHeaders,
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Configuration fetch finale
  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
  }

  // 🔄 Fonction de tentative
  const attemptFetch = async (attemptNumber: number): Promise<SafeFetchResponse<T>> => {
    try {
      // ⏱️ Créer un controller pour le timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 📊 Vérifier le statut
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        
        if (logErrors) {
          console.error(`[SafeFetch] HTTP ${response.status} Error:`, {
            url,
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          })
        }

        // 🔄 Retry pour certaines erreurs
        if (retry && attemptNumber < retries && isRetryableStatus(response.status)) {
          console.log(`[SafeFetch] Retrying (${attemptNumber}/${retries})...`)
          await delay(1000 * attemptNumber) // Backoff exponentiel
          return attemptFetch(attemptNumber + 1)
        }

        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          headers: response.headers,
        }
      }

      // 📦 Parser la réponse JSON
      let data: T
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        // Pour les réponses non-JSON
        const text = await response.text()
        data = text as any
      }

      return {
        success: true,
        data,
        status: response.status,
        headers: response.headers,
      }

    } catch (error: any) {
      if (logErrors) {
        console.error('[SafeFetch] Request failed:', {
          url,
          error: error.message,
          name: error.name,
        })
      }

      // 🔄 Retry en cas d'erreur réseau
      if (retry && attemptNumber < retries && isRetryableError(error)) {
        console.log(`[SafeFetch] Retrying (${attemptNumber}/${retries})...`)
        await delay(1000 * attemptNumber)
        return attemptFetch(attemptNumber + 1)
      }

      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  return attemptFetch(1)
}

/**
 * POST sécurisé avec JSON
 */
export async function safePost<T = any>(
  url: string,
  body: any,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * PUT sécurisé avec JSON
 */
export async function safePut<T = any>(
  url: string,
  body: any,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/**
 * DELETE sécurisé
 */
export async function safeDelete<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, {
    ...options,
    method: 'DELETE',
  })
}

// 🔧 Helpers

function isRetryableStatus(status: number): boolean {
  // Retry pour 408, 429, 500, 502, 503, 504
  return [408, 429, 500, 502, 503, 504].includes(status)
}

function isRetryableError(error: any): boolean {
  // Retry pour erreurs réseau et timeout
  return (
    error.name === 'AbortError' ||
    error.name === 'TypeError' ||
    error.message.includes('fetch') ||
    error.message.includes('network')
  )
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
