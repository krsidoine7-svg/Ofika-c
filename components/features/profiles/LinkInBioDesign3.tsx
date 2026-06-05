'use client'

import {
  Instagram,
  Globe,
  ExternalLink,
  Facebook,
  Twitter,
  MessageCircle,
  Play,
  Music,
  Sparkles,
  Palette,
  ShoppingBag,
  Mail,
  MapPin
} from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { AddToContactsAuto } from "@/components/AddToContactsAuto"
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SocialIcon } from "@/components/ui/social-icons"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"

interface LinkInBioDesign3Props {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

export function LinkInBioDesign3({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioDesign3Props) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const platformConfig: Record<string, { icon: any, color: string, emoji: string }> = {
    instagram: { icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500', emoji: '📸' },
    facebook: { icon: Facebook, color: 'bg-[#1877F2]', emoji: '👥' },
    twitter: { icon: Twitter, color: 'bg-[#1DA1F2]', emoji: '🐦' },
    youtube: { icon: Play, color: 'bg-[#FF0000]', emoji: '🎥' },
    tiktok: { icon: Music, color: 'bg-black', emoji: '🎵' },
    linkedin: { icon: Globe, color: 'bg-[#0A66C2]', emoji: '💼' },
    whatsapp: { icon: MessageCircle, color: 'bg-[#25D366]', emoji: '💬' },
    website: { icon: Globe, color: 'bg-indigo-500', emoji: '🌐' }
  }

  const allSocialLinks = (profile.social_links || []).filter(link => link.url);

  const iconLinks = allSocialLinks
    .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform))
    .map((link: any) => {
      const config = platformConfig[link.platform] || platformConfig.website
      return {
        name: link.platform,
        url: link.url,
        icon: config.icon,
        color: config.color,
        emoji: config.emoji
      }
    });

  const buttonSocialLinks = allSocialLinks.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform));

  const getLinkEmoji = (link: any) => {
    const title = link.title.toLowerCase()
    if (link.type === 'portfolio' || title.includes('portfolio')) return '🎨'
    if (link.type === 'shop' || title.includes('shop')) return '🛒'
    if (link.type === 'appointment' || title.includes('rendez-vous') || title.includes('rdv')) return '📅'
    if (link.type === 'contact' || title.includes('contact')) return '💌'
    return '✨'
  }

  const content = (
    <div className="flex flex-col items-center w-full relative">
      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-purple-300 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-orange-300 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-300 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <div className="relative mb-12 flex flex-col items-center z-10 w-full pt-8">
        {/* Artistic Profile Shape */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-black rotate-6 rounded-[2rem] transition-transform group-hover:rotate-12 duration-300" />
          <div className="absolute inset-0 bg-yellow-400 -rotate-3 rounded-[2rem] transition-transform group-hover:-rotate-6 duration-300 shadow-xl" />

          <div className="relative w-40 h-40 overflow-hidden rounded-[2rem] border-[4px] border-black bg-white shadow-2xl transition-transform group-hover:scale-[1.02] duration-300">
            {profile.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.name}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-black">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Floating Emoji */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl border-2 border-black flex items-center justify-center text-2xl shadow-lg animate-bounce">
            🎨
          </div>
        </div>

        {/* Title with Artistic Underline */}
        <div className="relative px-6">
          <h1 className="text-4xl font-black text-black mb-2 text-center relative z-10 tracking-tight">
            {profile.name}
          </h1>
          <div className="absolute bottom-3 left-0 right-0 h-4 bg-yellow-300/60 -rotate-1 z-0 rounded-full" />
        </div>

        {profile.bio && (
          <p className="text-lg font-bold text-gray-800 mb-6 text-center px-8 relative z-10 mt-2">
            "{profile.bio}"
          </p>
        )}

        {/* Social Icons - Pill Style */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 px-4 relative z-10">
          {iconLinks.map((social, index) => {
            const Icon = social.icon
            return (
              <button
                key={index}
                onClick={() => trackAndOpen(social.name, social.url)}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <div className={`w-6 h-6 rounded-md ${social.color} flex items-center justify-center`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-tighter">{social.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Actions - Blocky Neo-Brutalism */}
      <div className="w-full space-y-4 mb-10 px-6 relative z-10">
        {showAddToContacts && (
          <div className="space-y-3">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-black text-white rounded-2xl h-16 font-black text-lg border-2 border-black shadow-[8px_8px_0px_0px_#22D3EE] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:scale-95"
            />
            <Button
              variant="outline"
              className="w-full border-4 border-black bg-white text-black h-16 rounded-2xl font-black text-lg shadow-[8px_8px_0px_0px_#FACC15] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:scale-95"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-6 h-6 mr-3" />
              ÉCHANGER
            </Button>
          </div>
        )}

        {/* Boutique, Site Web as Primary Buttons */}
        {buttonSocialLinks.map((link: any, index: number) => {
          const labels: any = { shop: 'MA BOUTIQUE', website: 'MON SITE WEB', other: 'VOIR PLUS' };
          const colors: any = { shop: '#F472B6', website: '#818CF8', other: '#FB923C' };
          return (
            <Button
              key={`special-${index}`}
              className="w-full h-16 rounded-2xl font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:scale-95"
              style={{ backgroundColor: colors[link.platform] || '#A78BFA', color: 'white' }}
              onClick={() => trackAndOpen(link.platform, link.url)}
            >
              <div className="flex items-center justify-between w-full px-2">
                <span className="text-2xl drop-shadow-md">{getLinkEmoji({ platform: link.platform, type: link.platform, title: '' })}</span>
                <span className="flex-1 text-center truncate italic tracking-tighter">{labels[link.platform] || link.platform}</span>
                <ExternalLink className="w-5 h-5 opacity-50" />
              </div>
            </Button>
          );
        })}
      </div>

      <div className="w-full grid grid-cols-2 gap-4 px-6 mb-12 relative z-10">
        {(profile.custom_links || []).filter((l: any) => l.is_active !== false).map((link: any, index: number) => (
          <button
            key={index}
            onClick={() => trackAndOpen(link.title, link.url)}
            className="group flex flex-col items-center justify-center gap-3 bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all aspect-square text-center relative overflow-hidden"
          >
            {/* Hover Background Accent */}
            <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity" />

            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl shadow-inner border border-gray-100 mb-1 group-hover:scale-110 transition-transform">
              {getLinkEmoji(link)}
            </div>
            <span className="font-black text-black text-sm uppercase leading-tight tracking-tighter">
              {link.title}
            </span>
          </button>
        ))}
      </div>

      <div className="w-full px-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-10">
          <PublicReviewsSection profileId={profile.id} className="w-full" />
        </div>
      </div>

      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("C'est envoyé !")}
      />

      {/* Footer Branding */}
      <div className="mt-8 pb-12 text-center w-full relative z-10 px-6">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-105 transition-all duration-300 p-1 bg-black rounded-xl shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] border-2 border-white"
        >
          <div className="bg-black px-6 py-2 rounded-lg">
            <OfikaBlinkingLogo fontSize="text-2xl" color="text-white" />
          </div>
        </a>
      </div>
    </div>
  );

  if (isPreview) {
    return (
      <div className="h-full bg-[#FAFAFA] relative overflow-y-auto overflow-x-hidden p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center p-4">
      <div
        className="relative bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] border-4 border-black overflow-hidden"
        style={{
          aspectRatio: '390 / 844',
          maxWidth: '390px',
          maxHeight: '844px',
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative bg-[#FAFAFA]">
          <div className="p-4">{content}</div>
        </div>
      </div>
    </div>
  );
}
