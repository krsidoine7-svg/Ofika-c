import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  UserCheck,
  MessageCircle,
  BadgeCheck,
  Home,
  Search,
  Plus,
  Bell,
  User,
  ExternalLink,
  Award,
  Share2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { OfikaBlinkingLogo } from '@/components/brand/OfikaBlinkingLogo'
import { SocialIcon } from '@/components/ui/social-icons'

import { toast } from 'sonner'
import { generateCompleteVCard } from '@/lib/utils/vcard'

interface LinkInBioSocialCreatorProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

const defaultPortfolioPhotos = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
]

export function LinkInBioSocialCreator({
  profile,
  showAddToContacts = true,
  isPreview = false
}: LinkInBioSocialCreatorProps) {
  const [activeTab, setActiveTab] = useState<'galerie' | 'liens' | 'prix'>('galerie')
  const socialScrollRef = useRef<HTMLDivElement>(null)

  const coverUrl = profile?.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  const avatarUrl = profile?.image_url || profile?.profile_photo_url || null
  const name = profile?.name || 'Darrell Steward'
  const bio = profile?.bio || 'Photographe | Directeur Artistique'
  const links = profile?.links || profile?.custom_links || []

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
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.fr'
      const vcardContent = generateCompleteVCard(profile || {}, baseUrl)
      const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(profile?.name || 'contact').replace(/\s+/g, '_')}.vcf`
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

  const whatsappUrl = profile?.whatsapp
    ? (profile.whatsapp.startsWith('http')
        ? profile.whatsapp
        : `https://wa.me/${String(profile.whatsapp).replace(/[^0-9+]/g, '')}`)
    : 'https://wa.me/'

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
    if (profile?.facebook) {
      const url = profile.facebook.startsWith('http') ? profile.facebook : `https://facebook.com/${profile.facebook}`
      list.push({ key: 'facebook', label: 'Facebook', url, handle: profile.facebook })
    }
    if (profile?.linkedin) {
      const url = profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`
      list.push({ key: 'linkedin', label: 'LinkedIn', url, handle: profile.linkedin })
    }
    if (profile?.twitter) {
      const handle = String(profile.twitter).replace(/.*x\.com\//, '').replace(/.*twitter\.com\//, '').replace('@', '')
      const url = profile.twitter.startsWith('http') ? profile.twitter : `https://x.com/${handle}`
      list.push({ key: 'twitter', label: 'Twitter', url, handle: `@${handle}` })
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
    if (profile?.phone) {
      list.push({ key: 'phone', label: 'Téléphone', url: `tel:${profile.phone}`, handle: profile.phone })
    }
    if (profile?.email) {
      list.push({ key: 'email', label: 'Email', url: `mailto:${profile.email}`, handle: profile.email })
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

    if (list.length === 0 && isPreview) {
      return [
        { key: 'instagram', label: 'Instagram', url: 'https://instagram.com', handle: '@demo' },
        { key: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/', handle: 'WhatsApp Direct' }
      ]
    }

    return list
  }

  const activeChannels = getActiveChannels()

  return (
    <div className="w-full min-h-full bg-slate-50/90 text-slate-900 flex flex-col font-sans pb-16 relative">
      {/* 1. Couverture Image de fond */}
      <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-slate-200">
        <img
          src={coverUrl}
          alt="Cover"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* 2. Photo de Profil Avatar Superposée */}
      <div className="relative px-4 flex justify-center -mt-20 mb-3">
        <div className="relative">
          <div className="w-40 h-40 rounded-full p-[7px] bg-gradient-to-b from-white from-50% to-transparent to-50% shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-blue-600">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Nom & Sous-titre */}
      <div className="text-center px-4 mb-4">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
          <BadgeCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
        </div>
        <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">{bio}</p>
      </div>

      {/* 4. Boutons d'Action Principaux (Ajouter aux contacts & WhatsApp) */}
      <div className="flex items-center justify-center gap-2.5 px-4 mb-4">
        <button
          onClick={handleDownloadVCard}
          className="flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span className="truncate">Ajouter</span>
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all duration-200"
        >
          <SocialIcon platform="whatsapp" className="w-4 h-4 text-white" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* 4b. Rangée Horizontale Défilable (Scrollable) des Réseaux Sociaux avec Flèches */}
      {activeChannels.length > 0 && (
        <div className="w-full px-3 mb-5 relative flex items-center group/scroll">
          {/* Flèche Gauche */}
          {activeChannels.length > 3 && (
            <button
              type="button"
              onClick={handleScrollLeft}
              className="w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center -mr-2 z-10 hover:bg-slate-50 hover:scale-110 transition-all flex-shrink-0"
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            ref={socialScrollRef}
            className={`flex items-center gap-2.5 overflow-x-auto py-1.5 px-2 scrollbar-hide scroll-smooth w-full ${activeChannels.length > 3 ? 'justify-start' : 'justify-center'}`}
          >
            {activeChannels.map((channel) => (
              <a
                key={channel.key}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-2xl bg-white border border-blue-100/90 shadow-xs hover:shadow-md hover:border-blue-300 hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center p-1.5 group flex-shrink-0"
                title={channel.label}
              >
                <div className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center mb-0.5 group-hover:bg-blue-50 transition-colors">
                  <SocialIcon platform={channel.key} className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 truncate max-w-[56px] text-center group-hover:text-blue-600 transition-colors">
                  {channel.label}
                </span>
              </a>
            ))}
          </div>

          {/* Flèche Droite */}
          {activeChannels.length > 3 && (
            <button
              type="button"
              onClick={handleScrollRight}
              className="w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center -ml-2 z-10 hover:bg-slate-50 hover:scale-110 transition-all flex-shrink-0"
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 6. Onglets de Sous-Navigation Interactifs en Français */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between bg-blue-50/80 p-1.5 rounded-2xl border border-blue-100/50">
          {(
            [
              { id: 'galerie', label: 'Galerie' },
              { id: 'liens', label: 'Liens' },
              { id: 'prix', label: 'Prix' }
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-1.5 text-center text-xs font-bold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 7. Contenu des Onglets */}
      <div className="px-4 flex-1">
        <AnimatePresence mode="wait">

          {activeTab === 'galerie' && (
            <motion.div
              key="galerie"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {defaultPortfolioPhotos.slice(0, 3).map((src, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-blue-100/80 shadow-xs p-2">
                  <img src={src} alt={`Project ${i}`} className="w-full h-32 object-cover rounded-xl mb-2" />
                  <h4 className="font-bold text-xs text-slate-800 px-1">Projet Studio #{i + 1}</h4>
                  <p className="text-[10px] text-slate-400 px-1">Direction Artistique & Shooting HD</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'liens' && (
            <motion.div
              key="liens"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5"
            >
              {links.length > 0 ? (
                links.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-blue-100/80 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors block">
                          {link.title || link.name || 'Lien personnalisé'}
                        </span>
                        {link.url && (
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] block">
                            {link.url}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))
              ) : (
                <div className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-blue-100/80 shadow-xs hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors block">
                          Site Web Officiel
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">https://ofika.fr</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'prix' && (
            <motion.div
              key="prix"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5"
            >
              <div className="bg-white p-3.5 rounded-2xl border border-blue-100/80 shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Prix du Meilleur Directeur Artistique 2025</h4>
                  <p className="text-[10px] text-slate-400">Festival International du Design</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 8. Badge de Marque Bas de Page OFIKA */}
      <div className="mt-8 mb-4 text-center">
        <OfikaBlinkingLogo isDark={false} />
      </div>

      {/* 9. Dock Flottant de Navigation Inférieur */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-lg border border-slate-200/80 shadow-lg rounded-full px-4 py-2 flex items-center gap-5 text-slate-600">
        <button className="hover:text-blue-600 transition-colors">
          <Home className="w-4 h-4" />
        </button>
        <button className="hover:text-blue-600 transition-colors">
          <Search className="w-4 h-4" />
        </button>
        {/* Bouton central (+) */}
        <button className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" />
        </button>
        <button className="hover:text-blue-600 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="text-blue-600">
          <User className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
