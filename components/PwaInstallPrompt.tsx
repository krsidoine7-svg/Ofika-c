'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Share, PlusSquare } from 'lucide-react'

export function PwaInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [cookiesHandled, setCookiesHandled] = useState(false)

  useEffect(() => {
    // 1. Check Cookie Consent First
    const checkCookies = () => {
      const consent = localStorage.getItem('ofika_cookie_consent')
      if (consent) {
        setCookiesHandled(true)
      }
    }
    
    checkCookies()

    // Listen for cookie banner dismissal
    const handleCookieUpdate = () => setCookiesHandled(true)
    window.addEventListener('ofika_consent_update', handleCookieUpdate)

    // 2. Check if it's already installed
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone)
    console.log('[PWA] isRunningStandalone:', isRunningStandalone)

    if (isRunningStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
    console.log('[PWA] isIOS:', isIosDevice)

    if (isIosDevice) {
      // iOS doesn't support beforeinstallprompt natively
      setIsInstallable(true);
    }

    // Chrome / Edge / Android
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt event fired!')
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // In dev mode, if the event doesn't fire, we might still want to show the UI for testing
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => setIsInstallable(true), 2000); // Force show after 2s for design testing
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('ofika_consent_update', handleCookieUpdate);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("L'événement d'installation n'est pas prêt. (Test de design uniquement)")
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || !isInstallable || dismissed || !cookiesHandled) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[280px] md:bottom-8 md:right-8 md:w-[380px] z-[60] bg-white/70 backdrop-blur-2xl rounded-[20px] md:rounded-[28px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-3 md:p-6 animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] md:rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 flex items-center justify-center text-orange-500 shrink-0 shadow-inner border border-orange-200/50">
            <Download className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-black text-gray-900 text-[13px] md:text-[15px] tracking-tight leading-tight">Installer Ofika</h3>
            <p className="text-[10px] md:text-[12px] font-medium text-gray-500">Expérience native & hors-ligne</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all -mt-1 -mr-1">
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-4 md:mt-6">
        {isIOS ? (
          <div className="bg-white/50 rounded-xl md:rounded-2xl p-3 md:p-4 text-[12px] md:text-[13px] text-gray-600 flex flex-col gap-2 md:gap-3 border border-gray-200/50 shadow-sm">
            <p className="font-bold text-gray-900">Pour installer sur iPhone :</p>
            <ol className="flex flex-col gap-2.5 font-medium">
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-gray-900 border border-gray-100 shrink-0">1</span> 
                Appuyez sur Partager <Share className="w-4 h-4 ml-auto text-blue-500"/>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-gray-900 border border-gray-100 shrink-0">2</span> 
                Choisissez l'option <span className="font-bold text-gray-900 ml-auto flex items-center gap-1.5">Sur l'écran d'accueil <PlusSquare className="w-4 h-4 text-gray-900"/></span>
              </li>
            </ol>
          </div>
        ) : (
          <Button onClick={handleInstallClick} className="w-full bg-gradient-to-b from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white rounded-[14px] md:rounded-2xl h-10 md:h-12 text-[12px] md:text-[13px] font-bold tracking-wide shadow-lg shadow-black/10 transition-all active:scale-[0.98] border border-gray-800">
            Installer l'Application
          </Button>
        )}
      </div>
    </div>
  );
}
