'use client'

/**
 * ✅ FIX: Composant pour protéger contre les doubles chargements de scripts
 * Empêche l'erreur "Cannot redefine property"
 */

import { useEffect } from 'react'
import { initScriptProtection, cleanDuplicateScripts } from '@/lib/utils/script-loader-protection'

export function ScriptProtection() {
  useEffect(() => {
    // 🛡️ Initialiser les protections au montage
    initScriptProtection()

    // 🧹 Nettoyer les scripts dupliqués
    cleanDuplicateScripts()

    // 🔄 Nettoyer périodiquement (toutes les 5 secondes)
    const intervalId = setInterval(() => {
      cleanDuplicateScripts()
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // Ce composant ne rend rien
  return null
}
