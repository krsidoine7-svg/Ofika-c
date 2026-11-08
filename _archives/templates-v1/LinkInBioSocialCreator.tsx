'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  BadgeCheck,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Globe,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react'
import { OfikaBlinkingLogo } from '@/components/brand/OfikaBlinkingLogo'
import { SocialIcon } from '@/components/ui/social-icons'
import { toast } from 'sonner'
import { generateCompleteVCard } from '@/lib/utils/vcard'
import { ContactExchangeForm } from '@/components/features/contacts/ContactExchangeForm'
import { getThemeColors } from '@/lib/utils/theme-colors'

interface LinkInBioSocialCreatorProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

export function LinkInBioSocialCreator({
  profile,
  showAddToContacts = true,
  isPreview = false
}: LinkInBioSocialCreatorProps) {
  const [activeTab, setActiveTab] = useState<'liens' | 'reseaux' | 'infos'>('liens')
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const socialScrollRef = useRef<HTMLDivElement>(null)

  const coverUrl = profile?.cover_image_url || null
  const avatarUrl = profile?.image_url || profile?.profile_photo_url || null
  const name = profile?.name || 'Profil Professionnel'
  const bio = profile?.bio || ''
  const location = profile?.location || null
  const email = profile?.email || null
  const phone = profile?.phone || null
  const links = profile?.links || profile?.custom_links || []
  const { bg, accent, onBg, onBgMuted, onAccent, isDarkBg } = getThemeColors(profile, { bg: '#f8fafc', accent: '#0f172a' })

  const handleScrollLeft = () => {
    if (socialScrollRef.current) {
      socialScrollRef.current.scrollBy({ left: -140, behavior: 'smooth' })
    }
  }

  const handleScrollRight = () => {
    if (socialScrollRef.current) {
      socialScrollRef.current.scrollBy({ left: 140, behavior: 'smooth' })
    }
  }

  const handleDownloadVCard = () => {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci')
      const vcardContent = generateCompleteVCard(profile || {}, baseUrl)
      const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(name || 'contact').replace(/\s+/g, '_')}.vcf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Contact vCard généré et téléchargé !')
    } catch (err) {
      console.error('Erreur vCard:', err)
      toast.error('Erreur lors du téléchargement du vCard')
    }
  }

  const hasWhatsapp = Boolean(profile?.whatsapp)
  const whatsappUrl = hasWhatsapp
    ? (String(profile.whatsapp).startsWith('http')
        ? profile.whatsapp
        : `https://wa.me/${String(profile.whatsapp).replace(/[^0-9+]/g, '')}`)
    : null

  const getActiveChannels = () => {
    const list: Array<{ key: string; label: string; url: string; handle?: string }> = []
    
    if (profile?.whatsapp) {
      const clean = String(profile.whatsapp).replace(/[^0-9+]/g, '')
      const url = profile.whatsapp.startsWith('http') ? profile.whatsapp : `https://wa.me/${clean}`
      list.push({ key: 'whatsapp', label: 'WhatsApp', url, handle: profile.whatsapp })
    }
    if (profile?.instagram) {
      const handle = String(profile.instagram).replace(/.*instagram\.com\//, '').replace('@', '')
      const url = profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${handle}`
      list.push({ key: 'instagram', label: 'Instagram', url, handle: `@${handle}` })
    }
    if (profile?.linkedin) {
      const url = profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`
      list.push({ key: 'linkedin', label: 'LinkedIn', url, handle: profile.linkedin })
    }
    if (profile?.facebook) {
      const url = profile.facebook.startsWith('http') ? profile.facebook : `https://facebook.com/${profile.facebook}`
      list.push({ key: 'facebook', label: 'Facebook', url, handle: profile.facebook })
    }
    if (profile?.twitter) {
      const handle = String(profile.twitter).replace(/.*x\.com\//, '').replace(/.*twitter\.com\//, '').replace('@', '')
      const url = profile.twitter.startsWith('http') ? profile.twitter : `https://x.com/${handle}`
      list.push({ key: 'twitter', label: 'X (Twitter)', url, handle: `@${handle}` })
    }
    if (profile?.youtube) {
      const url = profile.youtube.startsWith('http') ? profile.youtube : `https://youtube.com/${profile.youtube}`
      list.push({ key: 'youtube', label: 'YouTube', url, handle: profile.youtube })
    }
    if (profile?.tiktok) {
      const handle = String(profile.tiktok).replace(/.*tiktok\.com\/@?/, '').replace('@', '')
      const url = profile.tiktok.startsWith('http') ? profile.tiktok : `https://tiktok.com/@${handle}`
      list.push({ key: 'tiktok', label: 'TikTok', url, handle: `@${handle}` })
    }
    if (profile?.website) {
      const url = profile.website.startsWith('http') ? profile.website : `https://${profile.website}`
      list.push({ key: 'website', label: 'Site Web', url, handle: profile.website })
    }
    if (phone) {
      list.push({ key: 'phone', label: 'Téléphone', url: `tel:${phone}`, handle: phone })
    }
    if (email) {
      list.push({ key: 'email', label: 'Email', url: `mailto:${email}`, handle: email })
    }

    if (Array.isArray(profile?.social_links)) {
      profile.social_links.forEach((item: any) => {
        if (item.url && !list.some(c => c.url === item.url)) {
          list.push({
            key: item.platform || 'website',
            label: item.title || item.platform || 'Lien',
            url: item.url,
            handle: item.url
          })
        }
      })
    }

    return list
  }

  const activeChannels = getActiveChannels()

  return (
    <div className="w-full min-h-full flex flex-col font-sans pb-12 relative" style={{ backgroundColor: bg, color: onBg }}>
      {/* 1. Couverture supérieure : Image réelle si fournie, sinon bandeau ardoise pur */}
      <div className="relative w-full h-32 sm:h-36 overflow-hidden" style={{ backgroundColor: accent }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Couverture"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }} />
        )}
      </div>

      {/* 2. Photo de Profil Avatar Superposée (Calibrée à 96px, sans dégradé) */}
      <div className="relative px-4 flex justify-center -mt-12 mb-3">
        <div className="w-24 h-24 rounded-full p-1 bg-white shadow-md flex items-center justify-center">
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-slate-900">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Nom & Bio réelle */}
      <div className="text-center px-4 mb-4">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h1 className="text-xl font-black tracking-tight" style={{ color: onBg }}>{name}</h1>
          <BadgeCheck className="w-4 h-4" style={{ color: onAccent, fill: accent }} />
        </div>
        {bio && (
          <p className="text-xs font-medium max-w-xs mx-auto leading-relaxed" style={{ color: onBgMuted }}>
            {bio}
          </p>
        )}
        {location && (
          <div className="flex items-center justify-center mt-1.5 text-xs font-medium" style={{ color: onBgMuted }}>
            <MapPin className="w-3 h-3 mr-1" />
            {location}
          </div>
        )}
      </div>

      {/* 4. Boutons d'Action Principaux en couleurs unies */}
      <div className="flex items-center justify-center gap-2.5 px-4 mb-5">
        <button
          onClick={handleDownloadVCard}
          className="flex-1 py-3 px-3 rounded-xl font-bold text-xs hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95"
          style={{ backgroundColor: accent, color: onAccent }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter au contact</span>
        </button>

        {hasWhatsapp && whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-3 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95"
          >
            <SocialIcon platform="whatsapp" className="w-4 h-4 text-white" />
            <span>WhatsApp</span>
          </a>
        )}

        <button
          onClick={() => setIsExchangeFormOpen(true)}
          className="py-3 px-3 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-gray-300 flex items-center justify-center gap-1.5 shadow-2xs transition-all duration-200 active:scale-95"
          title="Échanger les coordonnées"
        >
          <Mail className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {/* 5. Rangée Horizontale des Réseaux Sociaux Réels */}
      {activeChannels.length > 0 && (
        <div className="w-full px-3 mb-5 relative flex items-center group/scroll">
          {activeChannels.length > 4 && (
            <button
              type="button"
              onClick={handleScrollLeft}
              className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-700 flex items-center justify-center -mr-2 z-10 hover:bg-slate-50 transition-all flex-shrink-0"
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            ref={socialScrollRef}
            className={`flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-hide scroll-smooth w-full ${activeChannels.length > 4 ? 'justify-start' : 'justify-center'}`}
          >
            {activeChannels.map((channel) => (
              <a
                key={channel.key}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-xl bg-white border border-gray-200/90 shadow-2xs hover:border-slate-900 transition-all duration-200 flex flex-col items-center justify-center p-1 group flex-shrink-0"
                title={channel.label}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center mb-0.5">
                  <SocialIcon platform={channel.key} className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 truncate max-w-[50px] text-center">
                  {channel.label}
                </span>
              </a>
            ))}
          </div>

          {activeChannels.length > 4 && (
            <button
              type="button"
              onClick={handleScrollRight}
              className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-700 flex items-center justify-center -ml-2 z-10 hover:bg-slate-50 transition-all flex-shrink-0"
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 6. Onglets Utiles & Réels (Liens, Réseaux, Infos) */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between bg-slate-200/60 p-1 rounded-xl">
          {(
            [
              { id: 'liens', label: 'Liens' },
              { id: 'reseaux', label: 'Canaux' },
              { id: 'infos', label: 'À Propos' }
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 7. Contenu des Onglets 100% réel */}
      <div className="px-4 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'liens' && (
            <motion.div
              key="liens"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-2.5"
            >
              {links.length > 0 ? (
                links.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-slate-900 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 group-hover:underline block">
                          {link.title || link.name || 'Lien personnalisé'}
                        </span>
                        {link.url && (
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] block">
                            {link.url}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </a>
                ))
              ) : (
                <div className="p-6 text-center bg-white rounded-xl border border-dashed border-gray-200 text-slate-400 text-xs font-medium">
                  Aucun lien personnalisé ajouté pour l'instant.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reseaux' && (
            <motion.div
              key="reseaux"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {activeChannels.length > 0 ? (
                activeChannels.map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-slate-900 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <SocialIcon platform={c.key} className="w-4 h-4" />
                      <span className="text-xs font-bold text-slate-900">{c.label}</span>
                    </div>
                    {c.handle && (
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]">
                        {c.handle}
                      </span>
                    )}
                  </a>
                ))
              ) : (
                <div className="p-6 text-center bg-white rounded-xl border border-dashed border-gray-200 text-slate-400 text-xs font-medium">
                  Aucun réseau social configuré.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'infos' && (
            <motion.div
              key="infos"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-2.5 bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs text-xs"
            >
              <h4 className="font-bold text-slate-900 text-xs mb-2 uppercase tracking-wider text-slate-400">
                Coordonnées Directes
              </h4>
              {phone && (
                <div className="flex items-center gap-2 text-slate-700 py-1 border-b border-gray-100">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${phone}`} className="hover:underline font-medium">
                    {phone}
                  </a>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2 text-slate-700 py-1 border-b border-gray-100">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${email}`} className="hover:underline font-medium">
                    {email}
                  </a>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-slate-700 py-1 border-b border-gray-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{location}</span>
                </div>
              )}
              {bio && (
                <div className="pt-2 text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1">Présentation :</p>
                  <p>{bio}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ContactExchangeForm
        profileId={profile?.id || 'preview'}
        profileName={name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Coordonnées partagées avec succès !")}
      />

      {/* 8. Badge de Marque Bas de Page OFIKA */}
      <div className="mt-8 mb-2 text-center">
        <OfikaBlinkingLogo fontSize="text-xl" isDark={isDarkBg} />
      </div>
    </div>
  )
}
