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
      {/* Glass Profile Header */}
      <div className="relative w-full px-4 -mt-16 mb-6">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 flex flex-col items-center">
          {/* Profile Photo */}
          <div className="mb-4">
            {profile.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            {profile.name}
          </h1>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed text-center px-4 max-w-xs">
          {profile.bio}
        </p>
      )}

      {/* Localisation */}
      {profile.location && (
        <div className="flex items-center justify-center text-gray-500 mb-6 text-xs font-medium">
          <MapPin className="w-3 h-3 mr-1" />
          {profile.location}
        </div>
      )}

      {/* Social Media Icons (Standard) - Moved Above Actions */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false).length > 0 && (
        <div className="w-full mb-6">
          <div className="flex flex-wrap justify-center gap-4">
            {profile.social_links
              .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
              .map((link: any, index: number) => (
                <button
                  key={index}
                  className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:scale-110 transition-all"
                  onClick={() => trackAndOpen(link.platform, link.url)}
                >
                  <SocialIcon platform={link.platform} className="w-5 h-5" />
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Primary Action Buttons (Add to Contacts, Exchange, and Special Links) */}
      <div className="w-full mb-6 space-y-2 px-4">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl py-6 shadow-lg transform active:scale-95 transition-all"
            />
            <Button
              variant="outline"
              className="w-full border-2 border-blue-100 text-blue-700 py-6 rounded-xl font-semibold transform active:scale-95 transition-all"
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

      {/* Custom Links */}
      {profile.custom_links && profile.custom_links.filter((l: any) => l.is_active !== false).length > 0 && (
        <div className="w-full space-y-2 mb-6 px-4">
          {profile.custom_links.filter((l: any) => l.is_active !== false).map((link: any, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="w-full py-6 px-6 rounded-xl border-2 border-gray-100 shadow-sm"
              onClick={() => trackAndOpen(link.title, link.url)}
            >
              <div className="flex items-center justify-center space-x-2">
                {getLinkIcon(link)}
                <span className="font-medium text-gray-700">{link.title}</span>
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
        {profile.cover_image_url && (
          <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden z-0">
            <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
          </div>
        )}
        <div className="relative z-10 p-4 pt-32">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
          {profile.cover_image_url && (
            <div className="absolute top-0 left-0 right-0 h-40 sm:h-48 overflow-hidden z-0">
              <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
            </div>
          )}
          <div className="relative z-10 p-6 pt-32">{content}</div>
        </div>
      </div>
    </div>
  );
}