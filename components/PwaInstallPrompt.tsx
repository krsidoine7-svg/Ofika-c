'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share, PlusSquare } from 'lucide-react'

// Monogramme Officiel Ofika dans un cadre sobre et premium
const OfikaAppIcon = () => (
  <div className="w-11 h-11 rounded-lg bg-slate-950 p-2.5 flex items-center justify-center shadow-sm border border-slate-800/80 relative overflow-hidden flex-shrink-0">
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    <svg className="w-full h-full relative z-10" viewBox="0 0 73.69 74.29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFFFFF" d="m36.73,45.03c3.95-.09,7.08,3.1,7.57,7.71.78,7.24,1.31,7.87,8.39,9.33,3.39.7,6.07,2.32,5.99,6.13-.07,3.27-1.78,5.89-5.35,6.08-3.85.2-5.97-1.92-6.78-5.8-1.43-6.79-3.04-7.97-9.76-7.98-6.58-.01-8.14,1.22-9.7,7.97-.86,3.73-2.93,6.05-6.84,5.79-3.27-.22-5.03-2.42-5.16-5.65-.17-4.11,2.32-6.25,6.03-6.5,5.61-.38,7.59-3.56,8.09-8.76.54-5.52,3.25-8.22,7.53-8.31Z" />
      <path fill="#FFFFFF" d="m67.5,14.91c3.39.45,5.8,2.07,6.1,5.55.32,3.74-2.05,5.86-5.33,6.81-7.58,2.17-10.37,7.59-7.67,15.24.92,2.61,2.77,4.12,5.5,4.28,2.05.12,3.87.63,5.41,2.06,1.86,1.73,2.69,3.81,1.85,6.28-.81,2.4-2.61,3.86-5.09,4.16-2.53.31-4.52-.83-5.74-3.06-.54-.99-.81-2.16-1.04-3.29-1.38-6.62-2.44-7.61-9.04-8.29-4.82-.5-7.67-3.24-7.7-7.42-.03-4.39,2.96-7.44,7.97-7.57,5.12-.13,8.04-2.42,8.6-7.61.42-3.87,2.12-6.59,6.19-7.14Z" />
      <path fill="#FFFFFF" d="m0,52.87c.43-3.64,2.86-5.39,6.49-6.01,5.53-.94,7.32-3.42,7.27-9.79-.05-6.39-1.74-8.57-7.47-9.62C2.69,26.8.04,25.06.09,21.01c.04-3.46,2.03-5.72,5.45-5.91,3.94-.22,6.21,2.24,6.56,5.99.58,6.19,3.82,8.53,9.78,8.64,4.26.08,7.2,3.67,6.93,7.56-.3,4.42-2.67,6.92-7.15,7.39-7.45.79-7.86,1.17-9.56,8.74-.83,3.71-2.81,6.15-6.74,5.82-3.42-.29-5.13-2.64-5.37-6.38Z" />
      <path fill="#f97316" d="m37.51,29.19c-4.62.15-7.89-2.66-8.33-7.89-.48-5.78-2.85-8.76-8.77-9.21-3.51-.27-5.64-2.72-5.32-6.55C15.36,2.31,17.18.21,20.44.06c3.65-.16,5.7,1.99,6.58,5.51,1.94,7.73,7.99,10.62,15.28,7.5,3.51-1.5,3.77-4.64,4.44-7.76C47.43,2.04,49.52.03,52.97,0c3.12-.03,4.81,1.94,5.53,4.77.84,3.28-.61,6.32-3.56,6.66-7.84.89-11.03,4.9-11.31,12.69-.11,3.03-3.2,4.86-6.12,5.08Z" />
    </svg>
  </div>
)

export function PwaInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé la bannière dans cette session
    const isSessionDismissed = sessionStorage.getItem('ofika_pwa_dismissed')
    if (isSessionDismissed === 'true') {
      setDismissed(true)
      return
    }

    // Vérifier si l'application s'exécute déjà en mode standalone (déjà installée)
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(isRunningStandalone)
    if (isRunningStandalone) return

    // Détection iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    // Événement d'installation Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Minuteur de 25 secondes pour fermeture automatique non intrusive
  useEffect(() => {
    if ((isInstallable || isIOS) && !dismissed && !isStandalone && !showIosGuide) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, 25000)

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isIOS, dismissed, isStandalone, showIosGuide])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(!showIosGuide)
      return
    }

    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('ofika_pwa_dismissed', 'true')
  }

  // Ne pas afficher si déjà installée, si non éligible ou si déjà fermée
  if (isStandalone || dismissed || (!isInstallable && !isIOS)) return null

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.aside
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[350px] max-w-sm"
          role="region"
          aria-label="Installation de l'application"
        >
          <div className="relative overflow-hidden rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_10px_30px_-6px_rgba(15,23,42,0.12)] p-4 transition-all">
            {/* Liseré supérieur subtil rappelant l'orange Ofika */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

            {/* En-tête : Logo, Titre & Bouton Fermer */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <OfikaAppIcon />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                      Ofika
                    </h4>
                    <span className="text-[10px] font-medium tracking-wide text-orange-600 dark:text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                      App web
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Accédez à vos cartes et profils en 1 clic
                  </p>
                </div>
              </div>

              {/* Bouton Fermer discret */}
              <button
                type="button"
                onClick={handleDismiss}
                className="w-7 h-7 -mr-1 -mt-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Fermer la suggestion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Zone d'action ou Guide iOS */}
            <div className="mt-3.5">
              {isIOS && showIosGuide ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-wider">
                    2 étapes simples sur Safari :
                  </p>
                  
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <span className="flex-1">
                        Touchez le bouton <Share className="w-3.5 h-3.5 text-blue-500 inline mx-0.5 align-text-bottom" /> <strong>Partager</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <span className="flex-1">
                        Sélectionnez <PlusSquare className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 inline mx-0.5 align-text-bottom" /> <strong>Sur l'écran d'accueil</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowIosGuide(false)}
                    className="w-full text-center text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1 transition-colors cursor-pointer"
                  >
                    Fermer le guide
                  </button>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full h-10 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusSquare className="w-4 h-4 text-orange-400 dark:text-orange-600" />
                  <span>Ajouter à l'accueil</span>
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
