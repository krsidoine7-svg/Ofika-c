/**
 * ✅ FIX: Protection contre les doubles chargements de scripts
 * Empêche l'erreur "Cannot redefine property"
 */

// 🔒 Garde contre les doubles définitions de propriétés
export function protectGlobalProperty(propertyName: string): void {
  if (typeof window === 'undefined') return

  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, propertyName)
    
    // Si la propriété existe déjà et est configurable, on la protège
    if (descriptor && descriptor.configurable) {
      Object.defineProperty(window, propertyName, {
        ...descriptor,
        configurable: false, // Empêche la redéfinition
      })
    }
  } catch (error) {
    // Si la propriété est déjà non-configurable, on ignore silencieusement
    console.warn(`[Script Protection] Cannot protect property: ${propertyName}`)
  }
}

// 🛡️ Liste des propriétés à protéger (ajuster selon vos besoins)
const PROTECTED_PROPERTIES = [
  '__s@3s',
  'gtag',
  'dataLayer',
  'ga',
  '_vercel',
]

// 🚀 Initialiser les protections
export function initScriptProtection(): void {
  if (typeof window === 'undefined') return

  PROTECTED_PROPERTIES.forEach(prop => {
    protectGlobalProperty(prop)
  })
}

// 🔄 Wrapper pour charger des scripts externes de manière sécurisée
export function loadScriptSafely(
  src: string,
  options: {
    async?: boolean
    defer?: boolean
    id?: string
    onLoad?: () => void
    onError?: (error: Event) => void
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    // Vérifier si le script existe déjà
    const existingScript = options.id 
      ? document.getElementById(options.id)
      : document.querySelector(`script[src="${src}"]`)

    if (existingScript) {
      console.log(`[Script Protection] Script already loaded: ${src}`)
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = options.async ?? true
    script.defer = options.defer ?? false
    
    if (options.id) {
      script.id = options.id
    }

    script.onload = () => {
      console.log(`[Script Protection] Script loaded successfully: ${src}`)
      options.onLoad?.()
      resolve()
    }

    script.onerror = (error: Event | string) => {
      console.error(`[Script Protection] Error loading script: ${src}`, error)
      if (error instanceof Event && options.onError) {
        options.onError(error)
      }
      reject(new Error(`Failed to load script: ${src}`))
    }

    document.head.appendChild(script)
  })
}

// 🧹 Nettoyer les scripts dupliqués
export function cleanDuplicateScripts(): void {
  if (typeof window === 'undefined') return

  const scripts = document.querySelectorAll('script[src]')
  const seen = new Set<string>()
  const duplicates: HTMLScriptElement[] = []

  scripts.forEach((script) => {
    const src = (script as HTMLScriptElement).src
    if (seen.has(src)) {
      duplicates.push(script as HTMLScriptElement)
    } else {
      seen.add(src)
    }
  })

  // Supprimer les doublons
  duplicates.forEach(script => {
    console.warn(`[Script Protection] Removing duplicate script: ${script.src}`)
    script.remove()
  })

  if (duplicates.length > 0) {
    console.log(`[Script Protection] Removed ${duplicates.length} duplicate script(s)`)
  }
}
