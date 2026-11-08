'use client'

import { useState } from 'react'
import { Share2, Copy, Check, QrCode, X, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ProfileShareButtonProps {
  profileName: string
  profileSlug?: string
  theme?: 'light' | 'dark'
  className?: string
}

export function ProfileShareButton({
  profileName,
  profileSlug,
  theme = 'light',
  className = ''
}: ProfileShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Construction de l'URL publique absolue
  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    if (profileSlug) {
      return `${origin}/${profileSlug}`
    }
    return window.location.href
  }

  const handleCopyLink = async () => {
    const url = getShareUrl()
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      toast.success('Lien copié dans le presse-papiers !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  const handleNativeShare = async () => {
    const url = getShareUrl()
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: profileName,
          text: `Découvrez le profil de ${profileName}`,
          url
        })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const isDark = theme === 'dark'

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Partager ce profil ou afficher le QR code"
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-sm select-none ${
          isDark
            ? 'bg-[#18181b]/80 hover:bg-[#18181b] text-neutral-200 hover:text-white border border-white/15 backdrop-blur-md'
            : 'bg-white/85 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 backdrop-blur-md'
        } ${className}`}
      >
        <Share2 className="w-4 h-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[340px] sm:max-w-[380px] p-6 rounded-3xl bg-white border border-slate-100 shadow-2xl">
          <DialogHeader className="text-center sm:text-center space-y-1">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              Partager ce profil
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Scannez le QR code ou copiez le lien direct
            </DialogDescription>
          </DialogHeader>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center">
              <QRCodeSVG
                value={getShareUrl() || 'https://ofika.ci'}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 font-medium text-center">
              Pointez l&apos;appareil photo pour ouvrir
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 w-full">
            <Button
              type="button"
              onClick={handleCopyLink}
              className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 h-auto rounded-xl text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Lien copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le lien du profil</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleNativeShare}
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 h-auto rounded-xl text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Envoyer via une application...</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
