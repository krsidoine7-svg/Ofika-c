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

  const handleWhatsAppShare = () => {
    const url = getShareUrl()
    const text = `Bonjour, voici ma carte de visite digitale et mes coordonnées professionnelles : ${url}`
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
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
              onClick={handleWhatsAppShare}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 h-auto rounded-xl text-xs flex items-center justify-center gap-2.5 active:scale-98 transition-all shadow-md shadow-emerald-500/20"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Partager sur WhatsApp</span>
            </Button>

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
