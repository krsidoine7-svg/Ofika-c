'use client'

import { Button } from "@/components/ui/button"
import {
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Globe,
  ExternalLink,
  Facebook,
  Twitter,
  MessageCircle,
  Play,
  Music,
  Briefcase,
  Calendar,
  ShoppingBag
} from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { toast } from "sonner"
import { AddToContactsAuto } from "@/components/AddToContactsAuto"
import { SocialIcon, getSocialColor } from "@/components/ui/social-icons"
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"
import { ProfileShareButton } from "@/components/features/profiles/ProfileShareButton"
import { FeaturedLinksList } from "@/components/features/profiles/FeaturedLinksList"
import { ProfileMonogram } from "@/components/features/profiles/ProfileMonogram"

interface LinkInBioDesign1Props {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

export function LinkInBioDesign1({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioDesign1Props) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const themeSettings = profile.theme_settings || {}
  const primaryBg = themeSettings.primary_color || '#faf9f6'
  const accentColor = themeSettings.secondary_color || '#1c1917'

  const getLinkIcon = (link: any) => {
    if (link.type === 'website') return <Globe className="w-4 h-4" />
    if (link.type === 'shop') return <ShoppingBag className="w-4 h-4" />
    if (link.type === 'portfolio') return <Briefcase className="w-4 h-4" />
    if (link.type === 'appointment') return <Calendar className="w-4 h-4" />
    if (link.type === 'contact') return <Phone className="w-4 h-4" />
    return <ExternalLink className="w-4 h-4" />
  }

  const deviceDimensions = { width: 390, height: 844 }
  const deviceAspectRatio = '390 / 844'

  const content = (
    <div className="flex flex-col items-center w-full">
      {/* Profile Header Card */}
      <div className="relative w-full px-4 mb-6">
        <div 
          className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center relative"
          style={{ borderColor: `${accentColor}25` }}
        >
          {/* Share Button top-right */}
          <div className="absolute top-3.5 right-3.5 z-20">
            <ProfileShareButton
              profileName={profile.name}
              profileSlug={profile.custom_url || profile.username}
              theme="light"
            />
          </div>

          {/* Profile Photo / Luxury Monogram */}
          <div className="mb-4">
            <ProfileMonogram
              name={profile.name}
              imageUrl={profile.image_url}
              size="lg"
              shape="rounded-2xl"
              theme="light"
              customBorderColor={accentColor}
            />
          </div>

          {/* Name */}
          <h1 className="text-2xl font-black text-gray-900 text-center tracking-tight">
            {profile.name}
          </h1>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed text-center max-w-xs">
              {profile.bio}
            </p>
          )}

          {/* Localisation */}
          {profile.location && (
            <div className="flex items-center justify-center text-gray-500 mt-3 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {profile.location}
            </div>
          )}
        </div>
      </div>

      {/* Social Media Icons (Standard) */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false).length > 0 && (
        <div className="w-full mb-6 px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {profile.social_links
              .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
              .map((link: any, index: number) => (
                <button
                  key={index}
                  className="w-11 h-11 rounded-xl bg-white shadow-2xs border border-gray-200 flex items-center justify-center hover:border-gray-900 hover:scale-105 transition-all"
                  onClick={() => trackAndOpen(link.platform, link.url)}
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} className="w-5 h-5" />
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Primary Action Buttons (Add to Contacts & Exchange) */}
      <div className="w-full mb-6 space-y-2.5 px-4">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold rounded-xl py-6 shadow-sm transform active:scale-95 transition-all"
            />
            <Button
              variant="outline"
              className="w-full border border-gray-300 hover:border-gray-900 bg-white text-gray-800 py-6 rounded-xl font-bold transform active:scale-95 transition-all shadow-2xs"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Échanger les coordonnées
            </Button>
          </>
        )}

        {/* Special Links as Primary Buttons (Shop, Website, Other) */}
        {profile.social_links
          ?.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
          .map((link: any, index: number) => {
            const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Autre lien' };
            return (
              <Button
                key={`special-${index}`}
                className="w-full bg-gray-900 text-white py-6 rounded-xl hover:bg-gray-800 transition-all shadow-md group transform active:scale-95"
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <div className="flex items-center justify-center w-full relative">
                  <div className="absolute left-0 bg-white/10 p-1 rounded-lg">
                    <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold">{labels[link.platform] || link.platform}</span>
                  <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </Button>
            );
          })}
      </div>

      {/* Custom Links with Featured Hierarchy */}
      <div className="w-full px-4 mb-6">
        <FeaturedLinksList
          links={profile.custom_links}
          onLinkClick={trackAndOpen}
          theme="light"
          accentColor={accentColor}
        />
      </div>

      {/* Reviews */}
      <div className="w-full px-4">
        <PublicReviewsSection profileId={profile.id} className="mb-8" />
      </div>

      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Envoyé !")}
      />

      {/* Footer */}
      <div className="mt-8 pb-8 text-center w-full">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-105 transition-transform duration-200"
        >
          <OfikaBlinkingLogo fontSize="text-xl" />
        </a>
      </div>
    </div>
  );

  if (isPreview) {
    return (
      <div className="h-full relative" style={{ backgroundColor: primaryBg }}>
        {profile.cover_image_url && (
          <div className="absolute top-0 left-0 right-0 h-36 overflow-hidden z-0 border-b border-gray-200">
            <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
        <div className={`relative z-10 p-4 ${profile.cover_image_url ? 'pt-28' : 'pt-6'}`}>{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div
        className="relative bg-white shadow-xl overflow-hidden rounded-[32px] border border-gray-200/90"
        style={{
          aspectRatio: deviceAspectRatio,
          maxWidth: `${deviceDimensions.width}px`,
          maxHeight: `${deviceDimensions.height}px`,
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative">
          {profile.cover_image_url && (
            <div className="absolute top-0 left-0 right-0 h-36 sm:h-44 overflow-hidden z-0 border-b border-gray-200">
              <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`relative z-10 p-5 ${profile.cover_image_url ? 'pt-28' : 'pt-6'}`}>{content}</div>
        </div>
      </div>
    </div>
  );
}