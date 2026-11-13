'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share, PlusSquare } from 'lucide-react'

// Logo Officiel Ofika Orange sur Fond Blanc
const OfikaAppIcon = () => (
  <div className="w-11 h-11 rounded-xl bg-white p-2 flex items-center justify-center shadow-sm border border-slate-200/90 relative overflow-hidden flex-shrink-0">
    <svg className="w-full h-full relative z-10" viewBox="0 0 344.19 347" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#f97316" d="m171.53,210.3c18.45-.4,33.06,14.47,35.37,35.99,3.63,33.84,6.13,36.76,39.2,43.6,15.85,3.28,28.36,10.81,27.96,28.65-.34,15.3-8.3,27.53-25,28.39-17.96.93-27.86-8.99-31.68-27.08-6.7-31.7-14.18-37.22-45.56-37.28-30.74-.07-38.03,5.7-45.29,37.21-4.01,17.42-13.7,28.27-31.97,27.06-15.25-1.01-23.5-11.31-24.12-26.41-.8-19.2,10.84-29.18,28.17-30.37,26.21-1.8,35.43-16.65,37.79-40.93,2.5-25.76,15.17-38.4,35.16-38.84Z"/>
      <path fill="#f97316" d="m315.27,69.66c15.82,2.09,27.1,9.65,28.49,25.92,1.49,17.46-9.59,27.39-24.91,31.78-35.39,10.15-48.44,35.46-35.83,71.17,4.3,12.18,12.92,19.25,25.7,20.01,9.58.57,18.08,2.92,25.28,9.61,8.71,8.1,12.57,17.79,8.66,29.33-3.8,11.22-12.19,18.02-23.77,19.44-11.82,1.45-21.11-3.89-26.82-14.31-2.53-4.62-3.78-10.1-4.88-15.35-6.44-30.91-11.39-35.54-42.24-38.73-22.53-2.33-35.85-15.15-35.99-34.64-.15-20.49,13.82-34.73,37.22-35.34,23.89-.63,37.54-11.29,40.16-35.56,1.96-18.1,9.89-30.76,28.92-33.34Z"/>
      <path fill="#f97316" d="m0,246.93c2.03-17.01,13.36-25.17,30.31-28.05,25.82-4.39,34.21-15.98,33.97-45.71-.24-29.84-8.12-40.03-34.88-44.91C12.57,125.18.2,117.06.4,98.14c.17-16.18,9.49-26.71,25.48-27.61,18.39-1.04,29.02,10.48,30.66,27.98,2.71,28.91,17.83,39.85,45.7,40.36,19.9.36,33.61,17.14,32.38,35.3-1.4,20.65-12.49,32.33-33.42,34.53-34.79,3.67-36.73,5.46-44.63,40.82-3.87,17.34-13.15,28.74-31.49,27.2-15.96-1.34-23.95-12.35-25.07-29.79Z"/>
      <path fill="#f97316" d="m175.22,136.35c-21.57.7-36.87-12.44-38.89-36.85-2.23-27.02-13.33-40.92-40.98-43.03-16.37-1.25-26.33-12.68-24.86-30.58,1.24-15.12,9.77-24.94,24.97-25.59,17.05-.74,26.62,9.31,30.72,25.72,9.04,36.12,37.33,49.61,71.39,35.03,16.41-7.03,17.63-21.67,20.72-36.25C221.54,9.51,231.31.15,247.42,0c14.59-.14,22.45,9.06,25.82,22.28,3.91,15.31-2.86,29.54-16.61,31.1-36.6,4.14-51.52,22.87-52.85,59.25-.52,14.14-14.94,22.72-28.56,23.72Z"/>
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
