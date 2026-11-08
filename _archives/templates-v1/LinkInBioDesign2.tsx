'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  CreditCard,
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
import { ProfileShareButton } from "./ProfileShareButton"
import { ProfileMonogram } from "./ProfileMonogram"
import { FeaturedLinksList } from "./FeaturedLinksList"

interface LinkInBioDesign2Props {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

export function LinkInBioDesign2({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioDesign2Props) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const themeSettings = profile.theme_settings || {}
  const primaryBg = themeSettings.primary_color || '#f8fafc'
  const accentColor = themeSettings.secondary_color || '#2563eb'
  const bannerBg = themeSettings.primary_color ? themeSettings.primary_color : '#0b132b'

  const getLinkIcon = (link: any) => {
    if (link.type === 'website') return <Globe className="w-5 h-5" />
    if (link.type === 'shop') return <ShoppingBag className="w-5 h-5" />
    if (link.type === 'portfolio') return <Briefcase className="w-5 h-5" />
    if (link.type === 'appointment') return <Calendar className="w-5 h-5" />
    if (link.type === 'contact') return <Phone className="w-5 h-5" />
    return <ExternalLink className="w-5 h-5" />
  }

  const deviceDimensions = { width: 390, height: 844 }
  const deviceAspectRatio = '390 / 844'

  const content = (
    <div className="flex flex-col items-center w-full">
      {/* Profile Header */}
      <div className="relative w-full px-4 mt-2 mb-6 flex flex-col items-center">
        {/* Share Button */}
        <div className="absolute top-2 right-4 z-20">
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
            shape="rounded-full"
            theme="light"
            customBgColor="#0b132b"
            customTextColor="#ffffff"
            customBorderColor={accentColor}
          />
        </div>

        {/* Name */}
        <h1 className="text-2xl font-black text-slate-900 text-center tracking-tight">
          {profile.name}
        </h1>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-gray-600 mt-2 mb-1 text-center px-4 leading-relaxed max-w-xs">
            {profile.bio}
          </p>
        )}

        {/* Localisation */}
        {profile.location && (
          <div className="flex items-center justify-center text-gray-500 mt-2 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {profile.location}
          </div>
        )}
      </div>

      {/* Social Icons (Standard) */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false).length > 0 && (
        <div className="flex justify-center flex-wrap gap-2.5 mb-5 px-4">
          {profile.social_links
            .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
            .map((link: any, index: number) => (
              <button
                key={index}
                onClick={() => trackAndOpen(link.platform, link.url)}
                className="w-10 h-10 rounded-xl bg-slate-900 text-white shadow-xs border border-slate-800 flex items-center justify-center hover:bg-black hover:scale-105 transition-all"
                title={link.platform}
              >
                <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
              </button>
            ))}
        </div>
      )}

      {/* Primary Action Buttons (Add to Contacts, Exchange, and Special Links) */}
      <div className="w-full space-y-2.5 mb-6 px-4">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-6 rounded-xl shadow-sm transition-all transform active:scale-95"
            />
            <Button
              variant="outline"
              className="w-full border border-gray-300 hover:border-slate-900 bg-white text-slate-800 py-6 rounded-xl font-bold transition-all transform active:scale-95 shadow-2xs"
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
                className="w-full bg-slate-900 text-white py-6 rounded-xl hover:bg-black transition-all shadow-sm group border border-slate-800 transform active:scale-95"
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <div className="flex items-center justify-center w-full relative">
                  <div className="absolute left-0 bg-white/10 p-1.5 rounded-lg">
                    <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold tracking-wide text-xs text-white">
                    {labels[link.platform] || link.platform}
                  </span>
                  <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Button>
            );
          })}
      </div>

      {/* Featured & Custom Links */}
      {profile.custom_links && profile.custom_links.filter((l: any) => l.is_active !== false).length > 0 && (
        <div className="w-full px-4 mb-6">
          <FeaturedLinksList
            links={profile.custom_links}
            onLinkClick={(title, url) => trackAndOpen(title, url)}
            theme="light"
            accentColor={accentColor}
          />
        </div>
      )}

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
        <div className="absolute top-0 left-0 right-0 h-28 z-0">
          {profile.cover_image_url ? (
            <div className="relative w-full h-full border-b border-gray-200">
              <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-full border-b border-gray-200" style={{ backgroundColor: bannerBg }} />
          )}
        </div>
        <div className="relative z-10 pt-16">{content}</div>
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
          <div className="absolute top-0 left-0 right-0 h-32 z-0 border-b border-gray-200">
            {profile.cover_image_url ? (
              <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-900" />
            )}
          </div>
          <div className="relative z-10 pt-20">{content}</div>
        </div>
      </div>
    </div>
  );
}
