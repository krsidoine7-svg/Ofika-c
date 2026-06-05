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
      {/* Glass Profile Header */}
      <div className="relative w-full px-4 mt-4 mb-8 flex flex-col items-center">
          {/* Profile Photo */}
          <div className="mb-4">
            {profile.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-[#06B6D4] shadow-[0_0_40px_rgba(6,182,212,0.4)]"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#06B6D4] flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-3xl font-black text-black text-center uppercase tracking-[0.1em]">
            {profile.name}
          </h1>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-xs text-gray-600 mb-3 text-center px-4 leading-relaxed">
          {profile.bio}
        </p>
      )}

      {/* Localisation */}
      {profile.location && (
        <div className="flex items-center justify-center text-gray-500 mb-5 text-xs font-medium">
          <MapPin className="w-3 h-3 mr-1" />
          {profile.location}
        </div>
      )}

      {/* Social Icons (Standard) - Moved Above Actions */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false).length > 0 && (
        <div className="flex justify-center flex-wrap gap-4 mb-4">
          {profile.social_links
            .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
            .map((link: any, index: number) => (
              <button
                key={index}
                onClick={() => trackAndOpen(link.platform, link.url)}
                className="w-10 h-10 rounded-full bg-[#0F172A] shadow-lg border border-[#06B6D4]/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <SocialIcon platform={link.platform} className="w-5 h-5 text-[#22D3EE]" />
              </button>
            ))}
        </div>
      )}

      {/* Primary Action Buttons (Add to Contacts, Exchange, and Special Links) */}
      <div className="w-full space-y-2 mb-6 px-4">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-[#22D3EE] hover:bg-[#06B6D4] text-white font-black shadow-[0_4px_20px_rgba(34,211,238,0.4)] transition-all transform active:scale-95"
            />
            <Button
              variant="outline"
              className="w-full border-2 border-[#06B6D4]/30 text-[#06B6D4] py-6 rounded-xl hover:bg-[#06B6D4]/5 transition-all font-semibold transform active:scale-95"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Echanger des contacts
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
                className="w-full bg-[#0F172A] text-[#22D3EE] py-6 rounded-xl hover:bg-[#1E293B] transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] group border border-[#06B6D4]/20 transform active:scale-95"
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <div className="flex items-center justify-center w-full relative">
                  <div className="absolute left-0 bg-[#06B6D4]/10 p-1 rounded-lg">
                    <SocialIcon platform={link.platform} className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold tracking-wide uppercase text-xs text-white">
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

      {/* Custom Links Grid */}
      {profile.custom_links && profile.custom_links.filter((l: any) => l.is_active !== false).length > 0 && (
        <div className="w-full grid grid-cols-2 gap-3 px-4 mb-6">
          {profile.custom_links.filter((l: any) => l.is_active !== false).map((link: any, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="h-full min-h-[120px] p-3 flex flex-col items-center justify-center text-center border-2 border-gray-100 hover:border-[#06B6D4]/40 hover:bg-[#06B6D4]/5 transition-all text-[#0F172A] rounded-2xl group"
              onClick={() => trackAndOpen(link.title, link.url)}
            >
              <div className="p-2 bg-[#06B6D4]/10 rounded-xl mb-3 text-[#06B6D4] group-hover:scale-110 transition-transform">
                {getLinkIcon(link)}
              </div>
              <div className="text-[10px] sm:text-xs font-black text-[#0F172A] leading-tight w-full uppercase tracking-tight whitespace-normal break-words overflow-hidden">
                {link.title}
              </div>
            </Button>
          ))}
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
      <div className="mt-12 pb-8 text-center w-full">
        <a
          href="/onboarding/public-page"
          className="inline-block hover:scale-110 transition-transform duration-300"
        >
          <OfikaBlinkingLogo fontSize="text-2xl" />
        </a>
      </div>
    </div>
  );

  if (isPreview) {
    return (
      <div className="h-full bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-32 z-0">
          {profile.cover_image_url ? (
            <div className="relative w-full h-full">
              <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#06B6D4] opacity-40" />
          )}
        </div>
        <div className="relative z-10 pt-20">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{
          aspectRatio: deviceAspectRatio,
          maxWidth: `${deviceDimensions.width}px`,
          maxHeight: `${deviceDimensions.height}px`,
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-40 z-0 text-white">
            {profile.cover_image_url ? (
              <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#06B6D4]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/60 to-white"></div>
          </div>
          <div className="relative z-10 pt-24">{content}</div>
        </div>
      </div>
    </div>
  );
}
