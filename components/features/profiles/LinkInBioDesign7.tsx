'use client'

import { ProfileWithLinks } from '@/lib/types/database'
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Globe, Mail, Phone, MapPin, CheckCircle2, Users, Music, ExternalLink, Briefcase, Calendar, ShoppingBag } from 'lucide-react'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"
import { SocialIcon } from "@/components/ui/social-icons"

interface LinkInBioDesign7Props {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  isPreview?: boolean
}

export function LinkInBioDesign7({ profile, showAddToContacts, isPreview = false }: LinkInBioDesign7Props) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
    tiktok: Music,
    whatsapp: Globe,
    website: Globe
  }

  const allSocialLinks = (profile.social_links || []).filter(link => link.url);

  const iconLinks = allSocialLinks.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform));
  const buttonLinks = allSocialLinks.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform));

  const content = (
    <div className="flex flex-col items-center w-full px-6">
      {/* Profile Photo */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-800 shadow-2xl relative">
          {profile.image_url ? (
            <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mb-6 w-full">
        <h1 className="text-2xl font-bold mb-1 tracking-wide text-white">{profile.name}</h1>
        {profile.bio && (
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">{profile.bio}</p>
        )}
        {profile.location && (
          <div className="flex items-center justify-center text-gray-500 text-[10px] tracking-widest uppercase">
            <MapPin className="w-3 h-3 mr-2" />
            {profile.location}
          </div>
        )}
      </div>

      {iconLinks.length > 0 && (
        <div className="flex justify-center gap-4 mb-6">
          {iconLinks.map((social) => {
            const Icon = socialIcons[social.platform] || Globe
            return (
              <button
                key={social.platform}
                onClick={() => trackAndOpen(social.platform, social.url)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:scale-110 transition-all border border-gray-100 cursor-pointer p-0 text-gray-900"
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
      )}

      <div className="w-full mb-8 space-y-3">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-white text-gray-900 font-bold py-4 rounded-lg transform active:scale-95 transition-all shadow-xl"
            />
            <Button
              variant="outline"
              className="w-full bg-transparent border border-gray-700 text-gray-300 py-6 rounded-lg font-bold uppercase tracking-widest text-[10px] transform active:scale-95 transition-all"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Echanger
            </Button>
          </>
        )}

        {/* special links as buttons */}
        {buttonLinks.map((link: any, index: number) => {
          const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Autre lien' };
          return (
            <Button
              key={`special-${index}`}
              className="w-full bg-gray-800 text-white font-bold py-6 rounded-lg uppercase tracking-wider text-[10px] border border-gray-700 hover:bg-gray-700 transition-all flex items-center justify-between px-6 transform active:scale-95"
              onClick={() => trackAndOpen(link.platform, link.url)}
            >
              <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
              <span>{labels[link.platform] || link.platform}</span>
              <ExternalLink className="w-3 h-3 opacity-30" />
            </Button>
          );
        })}
      </div>

      <div className="w-full space-y-3 mb-8">
        {(profile.custom_links || []).map((link: any, index: number) => (
          <button
            key={index}
            onClick={() => trackAndOpen(link.title, link.url)}
            className="w-full bg-white text-gray-900 py-4 px-6 rounded-lg font-bold uppercase tracking-wide text-xs hover:bg-gray-100 transition-all cursor-pointer border-none flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {link.type === 'portfolio' && <Briefcase className="w-4 h-4 text-gray-600" />}
              {link.type === 'appointment' && <Calendar className="w-4 h-4 text-gray-600" />}
              {link.type === 'contact' && <Phone className="w-4 h-4 text-gray-600" />}
              {link.type === 'website' && <Globe className="w-4 h-4 text-gray-600" />}
              {link.type === 'shop' && <ShoppingBag className="w-4 h-4 text-gray-600" />}
              {!['portfolio', 'appointment', 'contact', 'website', 'shop'].includes(link.type) && <ExternalLink className="w-4 h-4 text-gray-600" />}
              <span>{link.title}</span>
            </div>
            <ExternalLink className="w-3 h-3 opacity-30" />
          </button>
        ))}
      </div>

      <div className="w-full">
        <PublicReviewsSection profileId={profile.id} className="mb-8" />
      </div>

      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("OK !")}
      />

      <div className="mt-12 pb-8 text-center w-full">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-110 transition-transform duration-300"
        >
          <OfikaBlinkingLogo fontSize="text-2xl" color="text-white" />
        </a>
      </div>
    </div>
  );

  const header = (
    <div className="relative h-48 overflow-hidden">
      {profile.cover_image_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm opacity-40"
          style={{ backgroundImage: `url(${profile.cover_image_url})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
    </div>
  );

  if (isPreview) {
    return (
      <div className="h-full bg-gray-900 relative overflow-y-auto custom-scrollbar">
        {header}
        <div className="relative z-10 -mt-24">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4 text-left">
      <div
        className="relative bg-gray-900 shadow-2xl overflow-hidden"
        style={{
          aspectRatio: '390 / 844',
          maxWidth: '390px',
          maxHeight: '844px',
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative">
          {header}
          <div className="relative z-10 -mt-24">{content}</div>
        </div>
      </div>
    </div>
  );
}
